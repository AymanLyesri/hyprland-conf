/*
 * Hyprland Wallpaper Daemon
 * Automatically changes wallpapers based on active workspace
 * Monitors Hyprland events and switches wallpapers per monitor configuration
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/un.h>
#include <stdbool.h>
#include <errno.h>
#include <time.h>
#include <signal.h>
#include <fcntl.h>
#include <sys/wait.h>

#define MAX_MONITORS 16
#define MAX_LINE_LEN 1024
#define MAX_PATH_LEN 1024
#define MAX_MONITOR_NAME 64
#define LOG_FILE "/tmp/wallpaper-daemon.log"
#define DEBOUNCE_MS 100

/* Monitor state tracking structure */
typedef struct {
    char name[MAX_MONITOR_NAME];
    int previous_workspace_id;
    char current_wallpaper[MAX_PATH_LEN];
    bool initialized;
} MonitorState;

/* Global state */
static MonitorState monitors[MAX_MONITORS];
static int monitor_count = 0;
static char hypr_dir[MAX_PATH_LEN];

/* Forward declarations */
void notify_error(const char* where, const char* message);
void log_info(const char* where, const char* message);
char* exec_command(const char* cmd);

/*
 * Recursively create directories (mkdir -p behavior)
 */
static bool ensure_dir(const char* path) {
    char tmp[MAX_PATH_LEN];
    size_t len = strnlen(path, sizeof(tmp));

    if (len == 0 || len >= sizeof(tmp)) {
        return false;
    }

    strncpy(tmp, path, sizeof(tmp) - 1);
    tmp[sizeof(tmp) - 1] = '\0';

    if (tmp[len - 1] == '/') {
        tmp[len - 1] = '\0';
    }

    for (char* p = tmp + 1; *p; p++) {
        if (*p == '/') {
            *p = '\0';
            if (mkdir(tmp, 0755) != 0 && errno != EEXIST) {
                return false;
            }
            *p = '/';
        }
    }

    if (mkdir(tmp, 0755) != 0 && errno != EEXIST) {
        return false;
    }

    return true;
}

/*
 * Copy file contents from src to dst
 */
static bool copy_file(const char* src, const char* dst) {
    FILE* in = fopen(src, "r");
    if (!in) {
        return false;
    }

    FILE* out = fopen(dst, "w");
    if (!out) {
        fclose(in);
        return false;
    }

    char buf[4096];
    size_t n;
    while ((n = fread(buf, 1, sizeof(buf), in)) > 0) {
        if (fwrite(buf, 1, n, out) != n) {
            fclose(in);
            fclose(out);
            return false;
        }
    }

    fclose(in);
    fclose(out);
    return true;
}

/*
 * Create monitor config structure and defaults.conf if missing or empty
 */
static void create_config_structure() {
    char* output = exec_command("hyprctl monitors -j | jq -r '.[].name'");
    if (!output) {
        notify_error("create_config_structure", "Failed to list monitors");
        return;
    }

    char base_dir[MAX_PATH_LEN];
    char backup_conf[MAX_PATH_LEN];
    snprintf(base_dir, sizeof(base_dir), "%s/wallpaper-daemon/config", hypr_dir);
    snprintf(backup_conf, sizeof(backup_conf), "%s/wallpaper-daemon/config/defaults.conf", hypr_dir);

    if (!ensure_dir(base_dir)) {
        notify_error("create_config_structure", "Failed to ensure base config directory");
        free(output);
        return;
    }

    char* saveptr = NULL;
    char* line = strtok_r(output, "\n", &saveptr);
    while (line) {
        char monitor_dir[MAX_PATH_LEN];
        char monitor_conf[MAX_PATH_LEN];

        snprintf(monitor_dir, sizeof(monitor_dir), "%s/%s", base_dir, line);
        snprintf(monitor_conf, sizeof(monitor_conf), "%s/defaults.conf", monitor_dir);

        if (!ensure_dir(monitor_dir)) {
            char error_msg[512];
            snprintf(error_msg, sizeof(error_msg), "Failed to create dir for %s", line);
            notify_error("create_config_structure", error_msg);
            line = strtok_r(NULL, "\n", &saveptr);
            continue;
        }

        struct stat st;
        bool needs_init = (stat(monitor_conf, &st) != 0) || (st.st_size == 0);
        if (needs_init) {
            if (!copy_file(backup_conf, monitor_conf)) {
                char error_msg[512];
                snprintf(error_msg, sizeof(error_msg), "Failed to init %s", monitor_conf);
                notify_error("create_config_structure", error_msg);
            }
        }

        line = strtok_r(NULL, "\n", &saveptr);
    }
    free(output);
}

/*
 * Process helpers — no system(), no SIGCHLD games.
 * (system() is broken when SIGCHLD is SIG_IGN: its internal waitpid fails
 * with ECHILD, so it returns -1 and status checks like `== 0` never pass.)
 */

/* Run argv synchronously, return exit code (or -1 on fork/wait error).
 * When null_io is true, child stdout/stderr go to /dev/null (for pgrep/pkill). */
static int run_wait_io(char* const argv[], bool null_io) {
    pid_t pid = fork();
    if (pid < 0) {
        return -1;
    }
    if (pid == 0) {
        if (null_io) {
            int devnull = open("/dev/null", O_WRONLY);
            if (devnull >= 0) {
                dup2(devnull, STDOUT_FILENO);
                dup2(devnull, STDERR_FILENO);
                if (devnull > STDERR_FILENO) {
                    close(devnull);
                }
            }
        }
        execvp(argv[0], argv);
        _exit(127);
    }
    int status = 0;
    while (waitpid(pid, &status, 0) < 0) {
        if (errno != EINTR) {
            return -1;
        }
    }
    if (WIFEXITED(status)) {
        return WEXITSTATUS(status);
    }
    return -1;
}

static int run_wait(char* const argv[]) {
    return run_wait_io(argv, false);
}

static int run_quiet(char* const argv[]) {
    return run_wait_io(argv, true);
}

/* Double-fork detach: grandchild is reparented to init, so no zombie
 * and no SIGCHLD handling required. Parent reaps the intermediate child. */
static void spawn_detached(char* const argv[]) {
    pid_t pid = fork();
    if (pid < 0) {
        fprintf(stderr, "spawn_detached: fork failed: %s\n", strerror(errno));
        return;
    }
    if (pid == 0) {
        if (fork() == 0) {
            execvp(argv[0], argv);
            _exit(127);
        }
        _exit(0);
    }
    int status = 0;
    while (waitpid(pid, &status, 0) < 0) {
        if (errno != EINTR) {
            break;
        }
    }
}

/*
 * Error notification system
 * Sends desktop notifications, logs to file, and prints to stderr
 * Rate-limited to avoid fork storms on hot paths (max 1 notify per 5s)
 */
void notify_error(const char* where, const char* message) {
    static struct timespec last_notify = {0, 0};
    struct timespec now_ts;
    clock_gettime(CLOCK_MONOTONIC, &now_ts);
    long elapsed_ms = (now_ts.tv_sec - last_notify.tv_sec) * 1000
        + (now_ts.tv_nsec - last_notify.tv_nsec) / 1000000;

    time_t now = time(NULL);
    struct tm* tm_info = localtime(&now);
    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", tm_info);

    // Always log; rate-limit only the expensive notify-send fork.
    FILE* log = fopen(LOG_FILE, "a");
    if (log) {
        fprintf(log, "[%s] %s: %s\n", timestamp, where, message);
        fclose(log);
    }

    fprintf(stderr, "[%s] ERROR in %s: %s\n", timestamp, where, message);

    if (elapsed_ms < 5000) {
        return;
    }
    last_notify = now_ts;

    char* const argv[] = {
        "notify-send", "-u", "critical",
        "Wallpaper Daemon Error", (char*)message, NULL
    };
    spawn_detached(argv);
}

/*
 * Info-level log without desktop notification.
 * Use for expected hot-path misses (empty workspace slots).
 */
void log_info(const char* where, const char* message) {
    time_t now = time(NULL);
    struct tm* tm_info = localtime(&now);
    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", tm_info);

    FILE* log = fopen(LOG_FILE, "a");
    if (log) {
        fprintf(log, "[%s] %s: %s\n", timestamp, where, message);
        fclose(log);
    }

    fprintf(stderr, "[%s] INFO in %s: %s\n", timestamp, where, message);
}

/*
 * Get or create monitor state
 * Returns pointer to existing monitor state or creates a new one
 */
MonitorState* get_monitor_state(const char* monitor_name) {
    for (int i = 0; i < monitor_count; i++) {
        if (strcmp(monitors[i].name, monitor_name) == 0) {
            return &monitors[i];
        }
    }
    
    if (monitor_count < MAX_MONITORS) {
        strncpy(monitors[monitor_count].name, monitor_name, MAX_MONITOR_NAME - 1);
        monitors[monitor_count].previous_workspace_id = -1;
        monitors[monitor_count].current_wallpaper[0] = '\0';
        monitors[monitor_count].initialized = false;
        return &monitors[monitor_count++];
    }
    
    return NULL;
}

/*
 * Execute shell command and capture output
 * Returns malloc'd buffer (caller must free). Grows dynamically.
 */
char* exec_command(const char* cmd) {
    FILE* fp = popen(cmd, "r");
    if (!fp) {
        char error_msg[512];
        snprintf(error_msg, sizeof(error_msg), "popen failed for '%s': %s", cmd, strerror(errno));
        notify_error("exec_command", error_msg);
        return NULL;
    }

    size_t cap = 8192, total = 0;
    char* buffer = malloc(cap);
    if (!buffer) {
        pclose(fp);
        return NULL;
    }

    size_t n;
    while ((n = fread(buffer + total, 1, cap - total - 1, fp)) > 0) {
        total += n;
        if (total + 1 >= cap) {
            size_t new_cap = cap * 2;
            char* grown = realloc(buffer, new_cap);
            if (!grown) {
                free(buffer);
                pclose(fp);
                return NULL;
            }
            buffer = grown;
            cap = new_cap;
        }
    }
    buffer[total] = '\0';
    pclose(fp);
    return buffer;
}

/*
 * Expand environment variables in file paths
 * Supports ~ and $HOME prefixes
 */
void expand_path(const char* input, char* output, size_t output_size) {
    const char* home = getenv("HOME");
    if (!home) home = "";
    
    if (input[0] == '~') {
        snprintf(output, output_size, "%s%s", home, input + 1);
    } else if (strncmp(input, "$HOME", 5) == 0) {
        snprintf(output, output_size, "%s%s", home, input + 5);
    } else {
        strncpy(output, input, output_size - 1);
        output[output_size - 1] = '\0';
    }
}

/*
 * Get wallpaper path for specific workspace
 * Reads from monitor-specific config file
 * Format: w-{workspace_id}={wallpaper_path}
 */
bool get_wallpaper_for_workspace(const char* monitor, int workspace_id, char* wallpaper, size_t size) {
    char config_path[MAX_PATH_LEN];
    snprintf(config_path, sizeof(config_path), "%s/wallpaper-daemon/config/%s/defaults.conf", hypr_dir, monitor);
    
    FILE* fp = fopen(config_path, "r");
    if (!fp) {
        char error_msg[512];
        snprintf(error_msg, sizeof(error_msg), "Cannot open config at %s: %s", config_path, strerror(errno));
        notify_error("get_wallpaper_for_workspace", error_msg);
        return false;
    }
    
    char line[MAX_LINE_LEN];
    char ws_key[32];
    snprintf(ws_key, sizeof(ws_key), "w-%d=", workspace_id);
    
    bool found = false;
    while (fgets(line, sizeof(line), fp)) {
        line[strcspn(line, "\n")] = 0;
        
        if (strncmp(line, ws_key, strlen(ws_key)) == 0) {
            strncpy(wallpaper, line + strlen(ws_key), size - 1);
            wallpaper[size - 1] = '\0';
            found = true;
            break;
        }
    }
    
    fclose(fp);
    return found;
}

/*
 * Single-snapshot monitor query: ONE hyprctl+jq invocation per wallpaper event.
 * Replaces the old N+1 pattern (get_monitors + get_active_workspace per monitor).
 * Output lines: "<monitor_name> <active_workspace_id>"
 */
int get_monitor_snapshot(char monitors_list[][MAX_MONITOR_NAME], int workspace_ids[]) {
    char* output = exec_command("hyprctl monitors -j | jq -r '.[] | \"\\(.name) \\(.activeWorkspace.id)\"'");
    if (!output) {
        notify_error("get_monitor_snapshot", "hyprctl command failed");
        return 0;
    }

    int count = 0;
    char* saveptr = NULL;
    char* line = strtok_r(output, "\n", &saveptr);
    while (line && count < MAX_MONITORS) {
        // Skip blanks
        while (*line == ' ' || *line == '\t') line++;
        if (*line == '\0') {
            line = strtok_r(NULL, "\n", &saveptr);
            continue;
        }

        char* space = strrchr(line, ' ');
        if (!space) {
            line = strtok_r(NULL, "\n", &saveptr);
            continue;
        }
        *space = '\0';

        if (strlen(line) == 0 || strlen(line) >= MAX_MONITOR_NAME) {
            line = strtok_r(NULL, "\n", &saveptr);
            continue;
        }
        // Defensive: skip special workspaces / numeric names if jq ever emits them
        if (strstr(line, "special")) {
            line = strtok_r(NULL, "\n", &saveptr);
            continue;
        }

        char* endptr = NULL;
        long ws = strtol(space + 1, &endptr, 10);
        if (endptr == space + 1) {
            line = strtok_r(NULL, "\n", &saveptr);
            continue;
        }

        strncpy(monitors_list[count], line, MAX_MONITOR_NAME - 1);
        monitors_list[count][MAX_MONITOR_NAME - 1] = '\0';
        workspace_ids[count] = (int)ws;
        count++;

        line = strtok_r(NULL, "\n", &saveptr);
    }

    free(output);
    return count;
}

/* Check if hyprpaper process is running (fork+waitpid, never system()) */
bool is_hyprpaper_running() {
    char* const argv[] = {"pgrep", "-x", "hyprpaper", NULL};
    return run_quiet(argv) == 0;
}

/* Check if wallpaper should be rendered via mpvpaper */
bool is_media_wallpaper(const char* wallpaper) {
    if (!wallpaper) {
        return false;
    }

    const char* dot = strrchr(wallpaper, '.');
    if (!dot || *(dot + 1) == '\0') {
        return false;
    }

    const char* ext = dot + 1;
    return strcasecmp(ext, "gif") == 0 || strcasecmp(ext, "mp4") == 0 || strcasecmp(ext, "webm") == 0;
}

/* Kill stale wallpaper helper scripts (pkill matches full cmdline; killall did not) */
void kill_wallpaper_script() {
    // Best-effort; pkill exits nonzero when nothing matches, which is fine.
    char* const argv1[] = {"pkill", "-f", "wallpaper-daemon/hyprpaper.sh", NULL};
    char* const argv2[] = {"pkill", "-f", "wallpaper-daemon/mpvpaper.sh", NULL};
    run_quiet(argv1);
    run_quiet(argv2);
}

/*
 * Spawn wallpaper helper without shell quoting hazards.
 * No system() string building: double-fork + exec avoids injection via
 * single-quotes/newlines in wallpaper paths and long-path truncation.
 * Grandchild is reparented to init, so no zombie and no SIGCHLD handling.
 */
static void spawn_wallpaper_script(const char* monitor, const char* wallpaper_path) {
    char script[MAX_PATH_LEN];
    int n = snprintf(script, sizeof(script), "%s/wallpaper-daemon/%s",
                     hypr_dir, is_media_wallpaper(wallpaper_path) ? "mpvpaper.sh" : "hyprpaper.sh");
    if (n < 0 || (size_t)n >= sizeof(script)) {
        notify_error("spawn_wallpaper_script", "Script path truncated");
        return;
    }

    char* const argv[] = {script, (char*)monitor, (char*)wallpaper_path, NULL};
    spawn_detached(argv);
}

/*
 * Main wallpaper change handler
 * Single hyprctl snapshot per event; throttled to DEBOUNCE_MS.
 * Only changes wallpaper when workspace or wallpaper path differs.
 */
void change_wallpaper() {
    // Throttle to at most one snapshot per DEBOUNCE_MS (rapid workspace flapping)
    static struct timespec last_run = {0, 0};
    struct timespec now_ts;
    clock_gettime(CLOCK_MONOTONIC, &now_ts);
    long elapsed_ms = (now_ts.tv_sec - last_run.tv_sec) * 1000
        + (now_ts.tv_nsec - last_run.tv_nsec) / 1000000;
    if (last_run.tv_sec != 0 && elapsed_ms < DEBOUNCE_MS) {
        usleep((useconds_t)((DEBOUNCE_MS - elapsed_ms) * 1000));
        clock_gettime(CLOCK_MONOTONIC, &now_ts);
    }
    last_run = now_ts;

    char monitors_list[MAX_MONITORS][MAX_MONITOR_NAME];
    int workspace_ids[MAX_MONITORS];
    int num_monitors = get_monitor_snapshot(monitors_list, workspace_ids);

    for (int i = 0; i < num_monitors; i++) {
        const char* monitor = monitors_list[i];
        int workspace_id = workspace_ids[i];

        MonitorState* state = get_monitor_state(monitor);
        if (!state) {
            char error_msg[512];
            snprintf(error_msg, sizeof(error_msg), "Max monitors (%d) reached for '%s'", MAX_MONITORS, monitor);
            notify_error("change_wallpaper", error_msg);
            continue;
        }

        /* Skip if workspace unchanged since last check */
        if (state->initialized && state->previous_workspace_id == workspace_id) {
            continue;
        }

        char wallpaper[MAX_PATH_LEN];
        if (!get_wallpaper_for_workspace(monitor, workspace_id, wallpaper, sizeof(wallpaper))) {
            char info_msg[512];
            snprintf(info_msg, sizeof(info_msg), "No wallpaper config for '%s' workspace %d (skipping)",
                     monitor, workspace_id);
            log_info("change_wallpaper", info_msg);
            // Remember workspace so we don't re-log on every duplicate event
            state->previous_workspace_id = workspace_id;
            state->initialized = true;
            continue;
        }

        // Empty slot (e.g. "w-5="): expected state, not an error. Skip quietly.
        if (wallpaper[0] == '\0') {
            state->previous_workspace_id = workspace_id;
            state->initialized = true;
            continue;
        }

        /* Skip if wallpaper path unchanged (workspace switch but same wallpaper) */
        if (state->initialized && strcmp(wallpaper, state->current_wallpaper) == 0) {
            state->previous_workspace_id = workspace_id;
            continue;
        }

        char expanded_wallpaper[MAX_PATH_LEN];
        expand_path(wallpaper, expanded_wallpaper, sizeof(expanded_wallpaper));
        
        /* Write current wallpaper to tracking file */
        char current_conf[MAX_PATH_LEN];
        snprintf(current_conf, sizeof(current_conf), "%s/wallpaper-daemon/config/current.conf", hypr_dir);
        FILE* fp = fopen(current_conf, "w");
        if (fp) {
            fprintf(fp, "%s\n", expanded_wallpaper);
            fclose(fp);
        } else {
            char error_msg[512];
            snprintf(error_msg, sizeof(error_msg), "Failed to write %s: %s", current_conf, strerror(errno));
            notify_error("change_wallpaper", error_msg);
        }
        
        kill_wallpaper_script();

        /* Execute wallpaper change script (fork+exec, no shell) */
        spawn_wallpaper_script(monitor, expanded_wallpaper);
        
        /* Update monitor state */
        strncpy(state->current_wallpaper, wallpaper, MAX_PATH_LEN - 1);
        state->previous_workspace_id = workspace_id;
        state->initialized = true;
    }
}

/*
 * Connect to Hyprland event socket
 * Returns socket file descriptor or -1 on error
 */
int connect_to_hyprland_socket() {
    const char* runtime_dir = getenv("XDG_RUNTIME_DIR");
    const char* hypr_instance = getenv("HYPRLAND_INSTANCE_SIGNATURE");
    
    if (!runtime_dir || !hypr_instance) {
        char error_msg[512];
        snprintf(error_msg, sizeof(error_msg), "%s not set - ensure Hyprland is running",
                 !runtime_dir ? "XDG_RUNTIME_DIR" : "HYPRLAND_INSTANCE_SIGNATURE");
        notify_error("connect_to_hyprland_socket", error_msg);
        return -1;
    }
    
    char socket_path[MAX_PATH_LEN];
    snprintf(socket_path, sizeof(socket_path), "%s/hypr/%s/.socket2.sock", runtime_dir, hypr_instance);
    
    int sock = socket(AF_UNIX, SOCK_STREAM, 0);
    if (sock < 0) {
        char error_msg[512];
        snprintf(error_msg, sizeof(error_msg), "Socket creation failed: %s", strerror(errno));
        notify_error("connect_to_hyprland_socket", error_msg);
        return -1;
    }
    
    struct sockaddr_un addr = {0};
    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, socket_path, sizeof(addr.sun_path) - 1);
    
    if (connect(sock, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        char error_msg[512];
        snprintf(error_msg, sizeof(error_msg), "Connection to %s failed: %s", socket_path, strerror(errno));
        notify_error("connect_to_hyprland_socket", error_msg);
        close(sock);
        return -1;
    }
    
    return sock;
}

/*
 * Main daemon loop
 * 1. Waits for hyprpaper to start
 * 2. Sets initial wallpapers
 * 3. Connects to Hyprland event socket
 * 4. Listens for workspace/monitor changes and updates wallpapers accordingly
 */
int main() {
    const char* home = getenv("HOME");
    if (!home) {
        notify_error("main", "HOME environment variable not set");
        return 1;
    }

    snprintf(hypr_dir, sizeof(hypr_dir), "%s/.config/hypr", home);

    // Unbuffered stdout so /tmp/wallpaper-loop.out shows progress live
    setvbuf(stdout, NULL, _IONBF, 0);

    // Wait for hyprpaper, but self-heal: if it never appears, start it
    // ourselves instead of blocking forever (hyprpaper has crashed before).
    printf("Waiting for hyprpaper to start...\n");
    int waited = 0;
    while (!is_hyprpaper_running()) {
        if (waited == 10) {
            printf("hyprpaper not found after 10s, starting it...\n");
            char* const argv[] = {"hyprpaper", NULL};
            spawn_detached(argv);
        }
        sleep(1);
        waited++;
    }
    printf("hyprpaper detected, proceeding...\n");

    usleep(300 * 1000);

    create_config_structure();

    printf("Setting initial wallpapers...\n");
    change_wallpaper();
    
    printf("Connecting to Hyprland socket...\n");
    int sock = connect_to_hyprland_socket();
    if (sock < 0) {
        notify_error("main", "Failed to connect to Hyprland event socket");
        return 1;
    }
    
    printf("Listening for workspace changes...\n");
    
    FILE* sock_file = fdopen(sock, "r");
    if (!sock_file) {
        char error_msg[512];
        snprintf(error_msg, sizeof(error_msg), "fdopen failed: %s", strerror(errno));
        notify_error("main", error_msg);
        close(sock);
        return 1;
    }
    
    char buffer[MAX_LINE_LEN];
    while (fgets(buffer, sizeof(buffer), sock_file)) {
        buffer[strcspn(buffer, "\n")] = 0;

        // "workspace>>" also matches "moveworkspace>>" as substring;
        // workspacev2 is a distinct event name and needs its own match.
        if (strstr(buffer, "workspace") || strstr(buffer, "focusedmon>>")) {
            printf("Workspace/Monitor change detected, updating wallpaper...\n");
            change_wallpaper();
        }
    }
    
    fclose(sock_file);
    return 0;
}

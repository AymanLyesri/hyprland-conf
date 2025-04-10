#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define MAX_IFACE_NAME 16

// Function to get the default network interface
char* get_default_interface() {
    FILE *file;
    char buffer[1024];
    char iface[MAX_IFACE_NAME];
    unsigned long destination;

    // Open /proc/net/route to read the routing table
    file = fopen("/proc/net/route", "r");
    if (!file) {
        perror("Unable to open /proc/net/route");
        exit(1);
    }

    // Skip the first line (header line)
    fgets(buffer, sizeof(buffer), file);

    // Read the routing table entries
    while (fgets(buffer, sizeof(buffer), file)) {
        // Parse the fields: iface, destination, gateway, flags, etc.
        if (sscanf(buffer, "%15s %lx", iface, &destination) == 2) {
            // Check if the destination is "0.0.0.0" (default route)
            if (destination == 0) {
                fclose(file);
                char *default_iface = malloc(strlen(iface) + 1);
                strcpy(default_iface, iface);
                return default_iface;
            }
        }
    }

    fclose(file);
    return NULL;  // No default route found
}

unsigned long long get_bytes(const char *interface, const char *type) {
    FILE *file;
    char buffer[1024];
    unsigned long long rx_bytes = 0, tx_bytes = 0;
    int found = 0;

    file = fopen("/proc/net/dev", "r");
    if (!file) {
        perror("Unable to open /proc/net/dev");
        exit(1);
    }

    // Skip the first two lines (header lines)
    fgets(buffer, sizeof(buffer), file);
    fgets(buffer, sizeof(buffer), file);

    while (fgets(buffer, sizeof(buffer), file)) {
        char iface[16];
        unsigned long long bytes_received, bytes_sent;
        
        // The interface name in /proc/net/dev ends with ':'
        if (sscanf(buffer, "%15[^:]: %llu %*llu %*llu %*llu %*llu %*llu %*llu %*llu %llu", 
                  iface, &bytes_received, &bytes_sent) == 3) {
            if (strcmp(iface, interface) == 0) {
                rx_bytes = bytes_received;
                tx_bytes = bytes_sent;
                found = 1;
                break;
            }
        }
    }

    fclose(file);

    if (!found) {
        fprintf(stderr, "Interface %s not found!\n", interface);
        exit(1);
    }

    if (strcmp(type, "RX") == 0) {
        return rx_bytes;
    } else if (strcmp(type, "TX") == 0) {
        return tx_bytes;
    }

    return 0;
}

int main() {
    char *default_iface = get_default_interface();
    if (default_iface == NULL) {
        fprintf(stderr, "No default route found. Exiting...\n");
        return 1;
    }

    unsigned long long rx_old, tx_old, rx_new, tx_new;
    unsigned long long rx_speed, tx_speed;

    // Get initial RX and TX bytes
    rx_old = get_bytes(default_iface, "RX");
    tx_old = get_bytes(default_iface, "TX");

    // Wait for 1 second (or longer)
    sleep(1);

    // Get new RX and TX bytes after the delay
    rx_new = get_bytes(default_iface, "RX");
    tx_new = get_bytes(default_iface, "TX");

    // Calculate speed in KB/s (bytes / 1024)
    rx_speed = (rx_new - rx_old) / 1024;  // KB per second
    tx_speed = (tx_new - tx_old) / 1024;  // KB per second

    printf("[%llu,%llu]\n", tx_speed, rx_speed);

    free(default_iface);
    return 0;
}

import { Gtk } from "astal/gtk3";
import { Waifu } from "../../interfaces/waifu.interface";
import { bind, exec, execAsync, Variable } from "astal";
import { Api } from "../../interfaces/api.interface";
import { readJson } from "../../utils/json";
import {
  booruApi,
  booruLimit,
  booruPage,
  booruTags,
  globalTransition,
  leftPanelWidth,
  waifuCurrent,
} from "../../variables";
import ToggleButton from "../toggleButton";
import { notify } from "../../utils/notification";

import hyprland from "gi://AstalHyprland";
import { closeProgress, openProgress } from "../Progress";
const Hyprland = hyprland.get_default();

const images = new Variable<Waifu[]>([]);

const imagePreviewPath = "./assets/booru/previews";
const imageUrlPath = "./assets/booru/images";
const waifuPath = "./assets/booru/waifu";

const apiList: Api[] = [
  {
    name: "Danbooru",
    value: "danbooru",
    idSearchUrl: "https://danbooru.donmai.us/posts/",
  },
  {
    name: "Gelbooru",
    value: "gelbooru",
    idSearchUrl: "https://gelbooru.com/index.php?page=post&s=view&id=",
  },
];

const ensureRatingTagFirst = () => {
  let tags: string[] = booruTags.get();
  // Find existing rating tag
  const ratingTag = tags.find((tag) => tag.match(/[-+]rating:explicit/));
  // Remove any existing rating tag
  tags = tags.filter((tag) => !tag.match(/[-+]rating:explicit/));
  // Add the previous rating tag at the beginning, or default to "-rating:explicit"
  tags.unshift(ratingTag ?? "-rating:explicit");
  booruTags.set(tags);
};

const cleanUp = () => {
  execAsync(`bash -c "rm -rf ${imagePreviewPath}/*"`);
  execAsync(`bash -c "rm -rf ${imageUrlPath}/*"`);
};

const fetchImage = async (
  image: Waifu,
  savePath: string,
  name: string = ""
) => {
  const url = image.url!;
  name = name || String(image.id);
  image.url_path = `${savePath}/${name}.webp`;

  await execAsync(`bash -c "mkdir -p ${savePath}"`).catch((err) =>
    notify({ summary: "Error", body: String(err) })
  );

  await execAsync(`curl -o ${savePath}/${name}.webp ${url}`).catch((err) =>
    notify({ summary: "Error", body: String(err) })
  );
};

const waifuThisImage = (image: Waifu) => {
  fetchImage(image, waifuPath, "waifu").then(() => {
    waifuCurrent.set(image);
  });
};

const OpenInBrowser = (image: Waifu) =>
  execAsync(
    `bash -c "xdg-open '${booruApi.get().idSearchUrl}${
      image.id
    }' && xdg-settings get default-web-browser | sed 's/\.desktop$//'"`
  )
    .then((browser) =>
      notify({ summary: "Waifu", body: `opened in ${browser}` })
    )
    .catch((err) => notify({ summary: "Error", body: err }));

const CopyImage = (image: Waifu) =>
  fetchImage(image, imageUrlPath).then(() => {
    execAsync(
      `bash -c "wl-copy --type image/png < ${imageUrlPath}/${image.id}.webp"`
    ).catch((err) => notify({ summary: "Error", body: err }));
  });

const OpenImage = (image: Waifu) => {
  fetchImage(image, imageUrlPath).then(() => {
    Hyprland.message_async(
      `dispatch exec [float;size 50%] feh --scale-down $HOME/.config/ags/${imageUrlPath}/${image.id}.webp`,
      (res) => {}
    );
  });
};
const fetchImages = async () => {
  try {
    openProgress();
    const res = await execAsync(
      `python /home/ayman/.config/ags/scripts/search-booru.py 
      --api ${booruApi.get().value} 
      --nsfw false 
      --tags '${booruTags.get().join(",")}' 
      --limit ${booruLimit.get()} 
      --page ${booruPage.get()}`
    );

    // 2. Process metadata without blocking
    const newImages: Waifu[] = readJson(res).map((image: any) => ({
      id: image.id,
      url: image.url,
      preview: image.preview,
      width: image.width,
      height: image.height,
      api: booruApi.get(),
    }));

    // 4. Prepare directory in background
    execAsync(`bash -c "mkdir -p ${imagePreviewPath}"`).catch((err) =>
      notify({ summary: "Error", body: String(err) })
    );

    // 5. Download images in parallel
    const downloadPromises = newImages.map((image) =>
      execAsync(
        `bash -c "[ -e "${imagePreviewPath}/${image.id}.jpg" ] || curl -o "${imagePreviewPath}/${image.id}.jpg" "${image.preview}""`
      )
        .then(() => {
          image.preview_path = `${imagePreviewPath}/${image.id}.jpg`;
          return image;
        })
        .catch((err) => {
          notify({ summary: "Error", body: String(err) });
          return null;
        })
    );

    // 6. Update UI when all downloads complete
    Promise.all(downloadPromises).then((downloadedImages) => {
      // Filter out failed downloads (null values)
      const successfulDownloads = downloadedImages.filter(
        (img) => img !== null
      );
      images.set(successfulDownloads);
      closeProgress();
    });
  } catch (err) {
    console.error(err);
    notify({ summary: "Error", body: String(err) });
    closeProgress();
  }
};
const Apis = () => (
  <box className="api-list" spacing={5}>
    {apiList.map((api) => (
      <ToggleButton
        state={bind(booruApi).as((a) => a.name === api.name)}
        className="api"
        label={api.name}
        onToggled={() => booruApi.set(api)}
      />
    ))}
  </box>
);

const imageActions = (image: Waifu) => {
  return (
    <revealer
      revealChild={false}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={globalTransition}
      child={
        <box
          className="actions"
          hexpand
          valign={Gtk.Align.END}
          halign={Gtk.Align.BASELINE}>
          <button
            valign={Gtk.Align.START}
            label=""
            onClicked={() => OpenInBrowser(image)}
            hexpand
          />
          <button
            valign={Gtk.Align.START}
            label=""
            onClicked={() => CopyImage(image)}
            hexpand
          />
          <button
            valign={Gtk.Align.START}
            label=""
            onClicked={() => OpenImage(image)}
            hexpand
          />
          <button
            valign={Gtk.Align.START}
            label=""
            onClicked={() => waifuThisImage(image)}
            hexpand
          />
        </box>
      }></revealer>
  );
};

const Images = () => {
  return (
    <scrollable
      hexpand
      vexpand
      child={
        <box className="images" vertical spacing={5}>
          {bind(images).as((images) =>
            images
              .reduce((rows: any[][], image, index) => {
                if (index % 2 === 0) rows.push([]); // Create a new row every 2 items
                rows[rows.length - 1].push(image); // Add the image to the current row
                return rows;
              }, [])
              .map((row) => (
                <box spacing={5}>
                  {row.map((image) => {
                    const revealer = imageActions(image);
                    return (
                      <eventbox
                        onHover={() => (revealer.reveal_child = true)}
                        onHoverLost={() => (revealer.reveal_child = false)}
                        child={
                          <box
                            hexpand
                            heightRequest={bind(leftPanelWidth).as(
                              (w) => w / 2
                            )}
                            className="image"
                            css={`
                              background-image: url("${image.preview_path}");
                              background-size: cover;
                              background-position: center;
                            `}
                            child={revealer}
                          />
                        }
                      />
                    );
                  })}
                </box>
              ))
          )}
        </box>
      }></scrollable>
  );
};

const PageDisplay = () => (
  <box className="pages" spacing={5} halign={Gtk.Align.CENTER}>
    {bind(booruPage).as((p) => {
      const buttons = [];

      // Show "1" button if the current page is greater than 3
      if (p > 3) {
        buttons.push(
          <button
            className={"first"}
            label="1"
            onClicked={() => booruPage.set(1)}
          />,
          <label>...</label>
        );
      }

      // Generate 5-page range dynamically without going below 1
      const startPage = Math.max(1, p - 2);
      const endPage = Math.max(5, p + 2);

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        buttons.push(
          <button
            label={String(pageNum)}
            sensitive={pageNum !== p}
            onClicked={() => booruPage.set(pageNum)}
          />
        );
      }
      return buttons;
    })}
  </box>
);

const LimitDisplay = () => {
  let debounceTimer: NodeJS.Timeout;

  return (
    <box className="limits" spacing={5} hexpand>
      <label>Limit</label>
      <slider
        value={bind(booruLimit).as((l) => l / 100)}
        className={"slider"}
        // min={4}
        // max={20}
        step={0.1}
        hexpand
        onValueChanged={(self) => {
          // Clear the previous timeout if any
          if (debounceTimer) clearTimeout(debounceTimer);
          print(self.value);

          // Set a new timeout with the desired delay (e.g., 300ms)
          debounceTimer = setTimeout(() => {
            booruLimit.set(Math.round(self.value * 100));
          }, 300);
        }}
      />
      <label>{bind(booruLimit)}</label>
    </box>
  );
};

const TagDisplay = () => (
  <box className="tags" spacing={5}>
    {bind(booruTags).as((tags) =>
      tags.map((tag) => {
        // check if tag is rating tag
        if (tag.match(/[-+]rating:explicit/)) {
          return (
            <button
              className={`rating ${tag.startsWith("+") ? "explicit" : "safe"}`}
              label={tag}
              onClicked={() => {
                const newRatingTag = tag.startsWith("-")
                  ? "+rating:explicit"
                  : "-rating:explicit";
                const newTags = booruTags
                  .get()
                  .filter((t) => !t.match(/[-+]rating:explicit/));
                newTags.unshift(newRatingTag);
                booruTags.set(newTags);
              }}
            />
          );
        }
        return (
          <button
            label={tag}
            onClicked={() => {
              const newTags = booruTags.get().filter((t) => t !== tag);
              booruTags.set(newTags);
            }}
          />
        );
      })
    )}
  </box>
);

const Entry = () => {
  const addTags = (self: Gtk.Entry) => {
    const currentTags = booruTags.get();
    const newTags = self.text.split(" ");

    // Create a Set to remove duplicates
    const uniqueTags = [...new Set([...currentTags, ...newTags])];

    booruTags.set(uniqueTags);
  };

  return <entry hexpand placeholderText="Add a Tag" onActivate={addTags} />;
};

const BottomBar = () => (
  <box className={"bottom"} spacing={10} vertical>
    <PageDisplay />
    <LimitDisplay />
    <box className="input-bar" vertical spacing={10}>
      <TagDisplay />
      <Entry />
    </box>
  </box>
);

export default () => {
  ensureRatingTagFirst();
  booruPage.subscribe(() => fetchImages());
  booruTags.subscribe(() => fetchImages());
  booruApi.subscribe(() => fetchImages());
  booruLimit.subscribe(() => fetchImages());
  cleanUp();
  fetchImages();
  return (
    <box className="booru" vertical hexpand spacing={10}>
      <Apis />
      <Images />
      <BottomBar />
    </box>
  );
};

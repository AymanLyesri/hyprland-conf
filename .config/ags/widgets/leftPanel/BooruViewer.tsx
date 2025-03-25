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
} from "../../variables";
import ToggleButton from "../toggleButton";
import { notify } from "../../utils/notification";

import hyprland from "gi://AstalHyprland";
const Hyprland = hyprland.get_default();

const images = new Variable<Waifu[]>([]);
booruPage.subscribe(() => fetchImages());

const imagePath = "./assets/booru/previews";

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
const fetchImages = async () => {
  try {
    // 1. Fetch image metadata
    print(
      `python /home/ayman/.config/ags/scripts/search-booru.py --api ${
        booruApi.get().value
      } --nsfw false --tags '${booruTags
        .get()
        .join(",")}' --limit ${booruLimit.get()} --page ${booruPage.get()}`
    );
    const res = await execAsync(
      `python /home/ayman/.config/ags/scripts/search-booru.py --api ${
        booruApi.get().value
      } --nsfw false --tags '${booruTags
        .get()
        .join(",")}' --limit ${booruLimit.get()} --page ${booruPage.get()}`
    );

    print(res);

    // 2. Process metadata without blocking
    const newImages: Waifu[] = readJson(res).map((image: any) => ({
      id: image.id,
      url: image.url,
      preview: image.preview,
      width: image.width,
      height: image.height,
      api: booruApi.get(),
    }));

    // 3. Clear existing data without waiting
    images.set([]);

    // 4. Prepare directory in background
    execAsync(`bash -c "rm -rf ${imagePath}/* && mkdir -p ${imagePath}"`).catch(
      (err) => notify({ summary: "Error", body: String(err) })
    );

    // 5. Download images in parallel
    const downloadPromises = newImages.map((image) =>
      execAsync(`curl -o ${imagePath}/${image.id}.jpg ${image.preview}`)
        .then(() => {
          image.preview_path = `${imagePath}/${image.id}.jpg`;
          return image;
        })
        .catch((err) => {
          notify({ summary: "Error", body: String(err) });
          return null; // Return null for failed downloads
        })
    );

    // 6. Update UI when all downloads complete
    Promise.all(downloadPromises).then((downloadedImages) => {
      // Filter out failed downloads (null values)
      const successfulDownloads = downloadedImages.filter(
        (img) => img !== null
      );
      images.set(successfulDownloads);
    });
  } catch (err) {
    console.error(err);
    notify({ summary: "Error", body: String(err) });
  }
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
  execAsync(`bash -c "wl-copy --type image/png < ${image.url_path}"`).catch(
    (err) => notify({ summary: "Error", body: err })
  );

const OpenImage = (image: Waifu) =>
  Hyprland.message_async(
    `dispatch exec [float;size 50%] feh --scale-down $HOME/.config/ags/${image.url_path}`,
    (res) => {
      notify({ summary: "Waifu", body: String(image.url_path) });
    }
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
                              background-image: url("${image.preview}");
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
          />
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

const TagDisplay = () => (
  <box className="tags" spacing={5} halign={Gtk.Align.CENTER}>
    {bind(booruTags).as((tags) => tags.map((tag) => <button label={tag} />))}
  </box>
);

const Entry = () => {
  const handleSubmit = (self: Gtk.Entry) => {
    fetchImages();
  };

  return (
    <entry
      hexpand
      placeholderText="Type a message"
      onChanged={(self) => {
        booruTags.set(self.text.split(" "));
      }}
      onActivate={handleSubmit}
    />
  );
};

const BottomBar = () => (
  <box spacing={10} vertical>
    <PageDisplay />
    <Entry />
    <TagDisplay />
  </box>
);

export default () => {
  fetchImages();
  return (
    <box className="booru" vertical hexpand spacing={5}>
      <Apis />
      <Images />
      <BottomBar />
    </box>
  );
};

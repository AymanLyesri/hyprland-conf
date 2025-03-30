import { closeProgress, openProgress } from "../../Progress";
import { execAsync } from "astal";
import { notify } from "../../../utils/notification";
import { booruApi, waifuCurrent } from "../../../variables";
import { Waifu } from "../../../interfaces/waifu.interface";

import hyprland from "gi://AstalHyprland";
import { previewFloatImage } from "../../../utils/image";
import { Gdk, Gtk } from "astal/gtk3";
const Hyprland = hyprland.get_default();

const waifuPath = "./assets/booru/waifu";
const imageUrlPath = "./assets/booru/images";

const fetchImage = async (
  image: Waifu,
  savePath: string,
  name: string = ""
) => {
  openProgress();
  const url = image.url!;
  name = name || String(image.id);
  image.url_path = `${savePath}/${name}.webp`;

  await execAsync(`bash -c "mkdir -p ${savePath}"`).catch((err) =>
    notify({ summary: "Error", body: String(err) })
  );

  await execAsync(
    `bash -c "[ -e "${imageUrlPath}/${image.id}.webp" ] || curl -o ${savePath}/${name}.webp ${url}"`
  ).catch((err) => notify({ summary: "Error", body: String(err) }));
  closeProgress();

  return image;
};

const waifuThisImage = async (image: Waifu) => {
  execAsync(`bash -c "curl -o ${waifuPath}/waifu.webp ${image.url}"`)
    .then(() => {
      waifuCurrent.set(image);
    })
    .catch((err) => notify({ summary: "Error", body: String(err) }));
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
    previewFloatImage(`${imageUrlPath}/${image.id}.webp`);
  });
};

export class ImageDialog {
  private dialog: Gtk.Dialog;

  constructor(img: Waifu) {
    fetchImage(img, imageUrlPath);
    // Create dialog without default action area
    this.dialog = new Gtk.Dialog({
      title: "booru-image",
      window_position: Gtk.WindowPosition.CENTER,
      modal: false,
    });

    // Get content area
    const contentArea = this.dialog.get_content_area();

    // Create main vertical box to hold everything
    const mainBox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 10,
      margin: 10,
    });
    contentArea.add(mainBox);

    // Add image
    const image = new Gtk.Image({
      file: img.preview_path,
      hexpand: false,
      vexpand: false,
    });
    mainBox.add(image);

    // Create centered button box
    const buttonBox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      halign: Gtk.Align.CENTER,
      spacing: 10,
      margin_top: 10,
    });

    // Create buttons with icons
    const buttons = [
      { icon: "", tooltip: "Open in browser", response: 1 },
      { icon: "", tooltip: "Copy image", response: 2 },
      { icon: "", tooltip: "Open image", response: 3 },
      { icon: "", tooltip: "Waifu this image", response: 4 },
    ];

    buttons.forEach((btn) => {
      const button = new Gtk.Button({
        label: btn.icon,
        halign: Gtk.Align.CENTER, // Center horizontally
        valign: Gtk.Align.CENTER, // Center vertically
      });

      // Add CSS class for styling
      const ctx = button.get_style_context();
      ctx.add_class("image-dialog-button");

      button.connect("clicked", () => {
        this.handleResponse(btn.response, img);
        this.dialog.destroy();
      });

      buttonBox.add(button);
    });

    mainBox.add(buttonBox);

    this.dialog.show_all();
  }

  private handleResponse(responseId: number, img: Waifu) {
    switch (responseId) {
      case 1:
        OpenInBrowser(img);
        break;
      case 2:
        CopyImage(img);
        break;
      case 3:
        OpenImage(img);
        break;
      case 4:
        waifuThisImage(img);
        break;
    }
  }
}

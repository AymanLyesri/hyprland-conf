import { GObject } from "astal";
import { astalify, ConstructProps, Gtk } from "astal/gtk3";

export class FileChooserButton extends astalify(Gtk.FileChooserButton) {
  static {
    GObject.registerClass(this);
  }

  constructor(
    props: ConstructProps<
      Gtk.FileChooserButton,
      Gtk.FileChooserButton.ConstructorProps,
      { onFileSet: [] }
    >
  ) {
    super(props as any);
  }
}

// export class FileChooserDialog extends astalify(Gtk.FileChooserDialog) {
//   static {
//     GObject.registerClass(this);
//   }

//   constructor(
//     props: ConstructProps<
//       Gtk.FileChooserDialog.ConstructorProps,
//       { onFileSet: [] }
//     >
//   ) {
//     super(props as any);
//   }
// }

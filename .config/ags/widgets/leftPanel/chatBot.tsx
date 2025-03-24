import { Gtk } from "astal/gtk3";
import { Message, Provider } from "../../interfaces/chatbot.interface";
import { bind, execAsync, Variable } from "astal";
import { notify } from "../../utils/notification";
import { readJSONFile, writeJSONFile } from "../../utils/json";

function formatTextWithCodeBlocks(text: string) {
  // Split the text by code blocks (```)
  const parts = text.split(/```(.*?)```/gs);

  // Create an array to hold all the elements
  const elements = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue; // Skip empty parts

    if (i % 2 === 1) {
      // Odd indices are code blocks (between ```)
      elements.push(
        <box className="code-block">
          <label
            className="text"
            hexpand
            wrap
            halign={Gtk.Align.START}
            label={part}
          />
          <button
            halign={Gtk.Align.END}
            valign={Gtk.Align.START}
            className={"copy"}
            label={""}
            onClick={() => {
              execAsync(`wl-copy "${part}"`).catch((err) => print(err));
            }}
          />
        </box>
      );
    } else {
      // Even indices are regular text
      elements.push(<label hexpand wrap xalign={0} label={part} />);
    }
  }

  return (
    <box className={"body"} vertical spacing={10}>
      {elements}
    </box>
  );
}

const fetchMessages = (provider: string) => {
  let fetched_messages = readJSONFile(`./assets/chatbot/${provider}.json`);
  if (Object.keys(fetched_messages).length > 0) {
    return fetched_messages;
  }
  return [];
};

const messages = Variable<Message[]>([]);

const sendMessage = (message: Message, provider: Variable<Provider>) => {
  execAsync(
    `bash -c "tgpt --provider ${provider.get().name} -q '${message.content}'"`
  )
    .then((response) => {
      notify({ summary: "Message sent", body: response });
      let newMessage = {
        id: (messages.get().length + 1).toString(),
        sender: provider.get().name,
        receiver: "me",
        content: response,
        timestamp: Date.now(),
      };
      messages.set([...messages.get(), newMessage]);
      writeJSONFile(
        `./assets/chatbot/${provider.get().name}.json`,
        messages.get()
      );
    })

    .catch((error) => {
      notify({ summary: "Error", body: error });
    });
};

const Info = (provider: Variable<Provider>) => (
  <box className={"info"} vertical spacing={5}>
    {bind(provider).as((provider) => [
      <label className={"name"} hexpand wrap label={`[${provider.name}]`} />,
      <label
        className={"description"}
        hexpand
        wrap
        label={provider.description}
      />,
    ])}
  </box>
);

const Messages = (provider: Variable<Provider>) => (
  <scrollable
    vexpand
    child={
      <box className={"messages"} vertical hexpand spacing={5}>
        {bind(messages).as((messages) =>
          messages.map((message) => (
            <box className={"message"} spacing={5}>
              <box
                className={"actions"}
                visible={message.sender !== "me"}
                vexpand={false}
                vertical>
                <label label={provider.get().icon}></label>
                <button
                  valign={Gtk.Align.END}
                  vexpand
                  className={"copy"}
                  label={""}
                  onClick={() => {
                    execAsync(`wl-copy "${message.content}"`).catch((err) =>
                      print(err)
                    );
                  }}
                />
              </box>
              {message.sender === "me" ? (
                <label
                  className={"body"}
                  hexpand
                  wrap
                  xalign={message.sender === "me" ? 1 : 0}
                  label={message.content}
                />
              ) : (
                formatTextWithCodeBlocks(message.content)
              )}
            </box>
          ))
        )}
      </box>
    }></scrollable>
);

const Clear = (provider: Variable<Provider>) => (
  <button
    label={""}
    className={"clear"}
    onClicked={() => {
      messages.set([]);
      writeJSONFile(
        `./assets/chatbot/${provider.get().name}.json`,
        messages.get()
      );
    }}
  />
);

const Entry = (provider: Variable<Provider>) => (
  <entry
    hexpand
    placeholderText="Type a message"
    onActivate={(self) => {
      let newMessage = {
        id: (messages.get().length + 1).toString(),
        sender: "me",
        receiver: provider.get().name,
        content: self.get_text(),
        timestamp: Date.now(),
      };
      messages.set([...messages.get(), newMessage]);
      sendMessage(newMessage, provider);
      self.set_text("");
    }}
  />
);

const Bottom = (provider: Variable<Provider>) => (
  <box spacing={5}>{[Entry(provider), Clear(provider)]}</box>
);

export default ({ provider }: { provider: Variable<Provider> }) => {
  messages.set(fetchMessages(provider.get().name));
  provider.subscribe((p) => {
    messages.set(fetchMessages(p.name));
  });

  return (
    <box className={"chat-bot"} vertical hexpand spacing={5}>
      {[Info(provider), Messages(provider), Bottom(provider)]}
    </box>
  );
};

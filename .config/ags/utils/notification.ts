import { execAsync } from "astal";

export function notify({ summary = '', body = '' }: { summary: string, body: string })
{

    print(`Notification: ${summary} - ${body}`);

    execAsync(`notify-send "${summary}" "${body}"`).catch((err) => print(err));

}
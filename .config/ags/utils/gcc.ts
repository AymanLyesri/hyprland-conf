import { exec } from "astal";

export async function compileBinaries()
{
    exec("gcc -o ./assets/binaries/bandwidth ./scripts/bandwidth.c");
}
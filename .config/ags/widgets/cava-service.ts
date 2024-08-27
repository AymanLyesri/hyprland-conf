const script = `
#! /bin/sh

printf "
[general]\n
framerate=60\n
bars = 12\n
[output]\n
method = raw\n
raw_target = /dev/stdout\ndata_format = ascii\nascii_max_range = 7\n" | \
  cava -p /dev/stdin | \
  sed -u 's/;//g;s/0/▁/g;s/1/▂/g;s/2/▃/g;s/3/▄/g;s/4/▅/g;s/5/▆/g;s/6/▇/g;s/7/█/g; '
`

class CavaService extends Service
{
    static {
        Service.register(this,
            { 'output-changed': ['string'], },
            { 'output': ['string'], },
        );
    }

    #output = ""
    #proc = ""

    constructor()
    {
        super()
        this.#proc = Utils.subprocess(
            ['bash', '-c', script],
            (output) => this.#onChange(output),
            (err) => logError(err),
        )
    }

    get output() { return this.#output }
    #onChange(output)
    {
        if (output === this.#output) {
            return;
        }

        this.#output = output
        this.changed('output');
        this.emit('output-changed', this.#output);
    }

}

const service = new CavaService;
export default service;
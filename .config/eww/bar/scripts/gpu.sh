#!/bin/bash

# This script is used to show the GPU usage of a given interface

output=$(radeontop -l 1 -d -)

percentages=$(echo "$output" | grep -oE '[0-9]+\.[0-9]+%' | sed 's/%//g' | tr '\n' ',' | sed 's/,$//')

echo "[$percentages]"

# percentages[0]: GPU: indicating how much of the GPU's processing power is currently being used.
# percentages[1]: EE: the EE (Execution Engine) utilization, indicating the usage of the Execution Engine.
# percentages[2]: VGT: utilization for VGT (Video Graphics Table), which is a component related to graphics processing.
# percentages[3]: TA: utilization for TA (Texture Addressing), which deals with memory addressing for textures.
# percentages[4]: SX: utilization for SX (Shader Execution), indicating the usage of shader execution units.
# percentages[5]: SH: utilization for SH (Shader Hardware), indicating the usage of shader hardware resources.
# percentages[6]: SPI: utilization for SPI (Serial Peripheral Interface), a synchronous serial communication interface.
# percentages[7]: SC: utilization for SC (Shader Core), indicating the usage of shader processing cores.
# percentages[8]: PA: utilization for PA (Primitive Assembly), which assembles vertices into primitives.
# percentages[9]: DB: utilization for DB (Database), which is often related to memory or storage.
# percentages[10]: CB: utilization for CB (Color Buffer), indicating the usage of the color buffer in graphics rendering.
# percentages[11]: VRAM: utilization for VRAM (Video RAM), indicating the usage of the dedicated video memory.
# percentages[12]: GTT: utilization for GTT (Graphics Translation Table), which translates virtual addresses to physical addresses in the graphics subsystem.
# percentages[13]: MCLK: utilization for MCLK (Memory Clock), indicating the usage of the memory clock frequency.
# percentages[14]: SCLK: utilization for SCLK (System Clock), indicating the usage of the system clock frequency.

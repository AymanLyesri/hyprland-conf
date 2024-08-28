#version 420 core

// input vertex
in vec4 fft_bars;

uniform mat4 projection_matrix;

void main() {
	gl_Position = fft_bars*projection_matrix;
}

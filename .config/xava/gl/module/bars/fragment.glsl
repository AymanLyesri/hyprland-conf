#version 420 core

// color passed from the host
uniform vec4 foreground_color;

// color passed from the host
uniform vec4 background_color;

// number of secionts that the gradient is divided to
uniform float gradient_sections;

// each of the gradient colors
uniform vec4 gradient_color[8];

// screen width and height
uniform vec2 resolution;

uniform float intensity;

layout(location=0) out vec4 FragColor;

void main() {
	if(gradient_sections > 0.0) {
		float across = (gl_FragCoord.y/resolution.y)*gradient_sections;
		int section = int(floor(across));
		float off = mod(across, 1.0);
		FragColor = mix(gradient_color[section], gradient_color[section+1], off);
	} else {
		FragColor = foreground_color;
	}
}


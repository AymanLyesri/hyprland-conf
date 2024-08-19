#version 420 core

in vec2 texCoord;

uniform sampler2D color_texture;
uniform sampler2D depth_texture;

uniform vec4 background_color;

layout(location=0) out vec4 FragColor;

vec4 correctForAlphaBlend(vec4 color) {
	return vec4(color.rgb*color.a, color.a);
}

vec4 append_color_properly(vec4 source, vec4 target) {
	target.rgb += mix(target.rgb, source.rgb, source.a);
	target.a    = max(target.a, source.a);
	return target;
}

void main() {
	// transfer background
	FragColor = texture(color_texture, texCoord);

	//FragColor = correctForAlphaBlend(FragColor);
}


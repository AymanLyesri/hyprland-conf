#version 420 core

// input vertex and texture coordinate
in vec4 v_texCoord; // vertex
in vec2 m_texCoord; // mapping

// output texture map coordinate
out vec2 texCoord;

void main() {
	gl_Position = v_texCoord;
	texCoord    = m_texCoord;
} 

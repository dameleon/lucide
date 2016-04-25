module Lucide {
    export class Factory {
        constructor(private context: WebGLRenderingContext) {
        }

        public Program(vertexShader: WebGLShader, fragmentShader: WebGLShader): Program {
            return new Program(this.context, vertexShader, fragmentShader);
        }

        public VertexShader(content: string): WebGLShader {
            return this.Shader(this.context.VERTEX_SHADER, content);
        }

        public FragmentShader(content: string): WebGLShader {
            return this.Shader(this.context.FRAGMENT_SHADER, content);
        }

        private Shader(type: number, content: string): WebGLShader {
            let shader = this.context.createShader(type);
            this.context.shaderSource(shader, content);
            this.context.compileShader(shader);
            if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
                throw new Error(this.context.getShaderInfoLog(shader));
            }
            return shader;
        }

        public Texture(unit: number = 0): Texture {
            return new Texture(this.context, unit);
        }

        public VertexBufferObject(size: number, value: Float32Array, usage?: number): VertexBufferObject {
            return new VertexBufferObject(this.context, size, value, usage);
        }

        public IndexBufferObject(value: Int16Array, usage?: number): IndexBufferObject {
            return new IndexBufferObject(this.context, value, usage);
        }
    }
}
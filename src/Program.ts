module Lucide {
    export class Program extends Context {
        public program: WebGLProgram;
        public vertexShader: WebGLShader;
        public fragmentShader: WebGLShader;
        public attributeMap = {
            "position": "position",
            "color": "color",
            "normal": "normal",
            "texture": "texCoord",
        };

        constructor(context: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            super(context);
            this.program = this.context.createProgram();
            this.linkShaders(vertexShader, fragmentShader);
        }

        public registerMesh(mesh: Mesh) {
            Object.keys(this.attributeMap).forEach((key) => {
                if (mesh[key] != undefined) {
                    console.log(mesh[key]);
                    this.createAttributeSetter(this.attributeMap[key]).set(mesh[key]);
                }
            });
        }

        public registerTextures(textures: Texture[]) {
            textures.forEach((tex) => {
                this.createUniformSetter("texture" + tex.unit).set1i(tex.unit);
            });
        }

        public createAttributeSetter(name: string): AttributeSetter {
            return new AttributeSetter(this.context, this.context.getAttribLocation(this.program, name));
        }

        public createUniformSetter(name: string) {
            return new UniformSetter(this.context, this.context.getUniformLocation(this.program, name));
        }

        public linkShaders(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            this.vertexShader = vertexShader;
            this.fragmentShader = fragmentShader;
            this.context.attachShader(this.program, this.vertexShader);
            this.context.attachShader(this.program, this.fragmentShader);
            this.context.linkProgram(this.program);
            if (!this.context.getProgramParameter(this.program, this.context.LINK_STATUS)) {
                throw new Error(this.context.getProgramInfoLog(this.program));
            }
            this.context.useProgram(this.program);
        }
    }
}


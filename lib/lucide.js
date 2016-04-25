var Lucide;
(function (Lucide) {
    class Context {
        constructor(context) {
            this.context = context;
        }
    }
    Lucide.Context = Context;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class AttributeSetter extends Lucide.Context {
        constructor(context, location) {
            super(context);
            this.location = location;
            this.context.enableVertexAttribArray(this.location);
        }
        setValue(size, value, usage) {
            return this.set(new Lucide.VertexBufferObject(this.context, size, value, usage));
        }
        set(vbo) {
            vbo.bind();
            this.context.vertexAttribPointer(this.location, vbo.size, this.context.FLOAT, false, 0, 0);
            return this;
        }
    }
    Lucide.AttributeSetter = AttributeSetter;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class BufferObject extends Lucide.Context {
        constructor(context, value, usage) {
            super(context);
            this.usage = usage;
            this.buffer = this.context.createBuffer();
        }
        initialize(value) {
            this.bind();
            this.setData(value);
            this.unbind();
        }
        setData(value) {
            this.context.bufferData(this.target, value, this.usage);
        }
        bind() {
            this.context.bindBuffer(this.target, this.buffer);
        }
        unbind() {
            this.context.bindBuffer(this.target, null);
        }
    }
    class VertexBufferObject extends BufferObject {
        constructor(context, size, value, usage = context.STATIC_DRAW) {
            super(context, value, usage);
            this.size = size;
            this.usage = usage;
            this.target = this.context.ARRAY_BUFFER;
            this.initialize(value);
        }
    }
    Lucide.VertexBufferObject = VertexBufferObject;
    class IndexBufferObject extends BufferObject {
        constructor(context, value, usage = context.STATIC_DRAW) {
            super(context, value, usage);
            this.usage = usage;
            this.target = this.context.ELEMENT_ARRAY_BUFFER;
            this.size = value.length;
            this.initialize(value);
        }
    }
    Lucide.IndexBufferObject = IndexBufferObject;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class Factory {
        constructor(context) {
            this.context = context;
        }
        Program(vertexShader, fragmentShader) {
            return new Lucide.Program(this.context, vertexShader, fragmentShader);
        }
        VertexShader(content) {
            return this.Shader(this.context.VERTEX_SHADER, content);
        }
        FragmentShader(content) {
            return this.Shader(this.context.FRAGMENT_SHADER, content);
        }
        Shader(type, content) {
            let shader = this.context.createShader(type);
            this.context.shaderSource(shader, content);
            this.context.compileShader(shader);
            if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
                throw new Error(this.context.getShaderInfoLog(shader));
            }
            return shader;
        }
        Texture(unit = 0) {
            return new Lucide.Texture(this.context, unit);
        }
        VertexBufferObject(size, value, usage) {
            return new Lucide.VertexBufferObject(this.context, size, value, usage);
        }
        IndexBufferObject(value, usage) {
            return new Lucide.IndexBufferObject(this.context, value, usage);
        }
        Material(mesh, ...textures) {
            return new Lucide.Material(this.context, mesh, ...textures);
        }
        Mesh(position, index, texture, color, normal) {
            return new Lucide.Mesh(this.context, position, index, texture, color, normal);
        }
        View(program, material) {
            return new Lucide.View(this.context, program, material);
        }
    }
    Lucide.Factory = Factory;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class GL extends Lucide.Context {
        constructor(canvas) {
            super(canvas.getContext("experimental-webgl"));
            this.clearColor = [0.0, 0.0, 0.0, 0.0];
            this.clearDepth = 1.0;
            this.clearFlag = (this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
            this.Factory = new Lucide.Factory(this.context);
        }
        clear() {
            this.context.clearColor.apply(this.context, this.clearColor);
            this.context.clearDepth(this.clearDepth);
            this.context.clear(this.clearFlag);
        }
        flush() {
            this.context.flush();
        }
        drawArrays(mode, vbo, first = 0) {
            vbo.bind();
            this.context.drawArrays(mode, first, vbo.size);
        }
        drawElements(mode, ibo, type = this.context.UNSIGNED_SHORT, offset = 0) {
            ibo.bind();
            this.context.drawElements(mode, ibo.size, type, offset);
        }
        exec(target) {
            target(this.context);
        }
    }
    Lucide.GL = GL;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class Material extends Lucide.Context {
        constructor(context, mesh, ...textures) {
            super(context);
            this.mesh = mesh;
            this.textures = textures;
        }
    }
    Lucide.Material = Material;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class Mesh extends Lucide.Context {
        constructor(context, position, index, texture, color, normal) {
            super(context);
            this.usage = this.context.STATIC_DRAW;
            this.type = this.context.TRIANGLES;
            this.size = 3;
            this.position = new Lucide.VertexBufferObject(this.context, this.size, position, this.usage);
            this.index = new Lucide.IndexBufferObject(this.context, index, this.usage);
            !texture || (this.texture = new Lucide.VertexBufferObject(this.context, 2, texture, this.usage));
            !color || (this.color = new Lucide.VertexBufferObject(this.context, this.size, color, this.usage));
            !normal || (this.normal = new Lucide.VertexBufferObject(this.context, this.size, normal, this.usage));
        }
    }
    Lucide.Mesh = Mesh;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class Program extends Lucide.Context {
        constructor(context, vertexShader, fragmentShader) {
            super(context);
            this.attributeMap = {
                "position": "position",
                "color": "color",
                "normal": "normal",
                "texture": "texCoord",
            };
            this.attributeSetters = {};
            this.uniformSetters = {};
            this.program = this.context.createProgram();
            this.linkShaders(vertexShader, fragmentShader);
        }
        registerMesh(mesh) {
            Object.keys(this.attributeMap).forEach((key) => {
                if (mesh[key] != undefined) {
                    this.createAttributeSetter(this.attributeMap[key]).set(mesh[key]);
                }
            });
        }
        registerTextures(textures) {
            textures.forEach((tex) => {
                this.createUniformSetter("texture" + tex.unit).set1i(tex.unit);
            });
        }
        createAttributeSetter(name) {
            if (this.attributeSetters[name] == undefined) {
                this.attributeSetters[name] = new Lucide.AttributeSetter(this.context, this.context.getAttribLocation(this.program, name));
            }
            return this.attributeSetters[name];
        }
        createUniformSetter(name) {
            if (this.uniformSetters[name] == undefined) {
                this.uniformSetters[name] = new Lucide.UniformSetter(this.context, this.context.getUniformLocation(this.program, name));
            }
            return this.uniformSetters[name];
        }
        linkShaders(vertexShader, fragmentShader) {
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
    Lucide.Program = Program;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class Texture extends Lucide.Context {
        constructor(context, unit) {
            super(context);
            this.unit = unit;
            this.texture = this.context.createTexture();
            this.index = this.context.TEXTURE0 + unit;
        }
        set(content, createsMitmap = true, level = 0, internalFormat = this.context.RGBA, format = this.context.RGBA, type = this.context.UNSIGNED_BYTE) {
            this.bind();
            this.context.texImage2D(this.context.TEXTURE_2D, level, internalFormat, format, type, content);
            if (createsMitmap) {
                this.context.generateMipmap(this.context.TEXTURE_2D);
            }
            this.unbind();
        }
        bind() {
            this.context.activeTexture(this.index);
            this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
        }
        unbind() {
            this.context.bindTexture(this.context.TEXTURE_2D, null);
        }
    }
    Lucide.Texture = Texture;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class UniformSetter extends Lucide.Context {
        constructor(context, location) {
            super(context);
            this.location = location;
        }
        set1f(x) {
            this.context.uniform1f(this.location, x);
            return this;
        }
        set2f(x, y) {
            this.context.uniform2f(this.location, x, y);
            return this;
        }
        set3f(x, y, z) {
            this.context.uniform3f(this.location, x, y, z);
            return this;
        }
        set4f(x, y, z, w) {
            this.context.uniform4f(this.location, x, y, z, w);
            return this;
        }
        set1i(x) {
            this.context.uniform1i(this.location, x);
            return this;
        }
        set2i(x, y) {
            this.context.uniform2i(this.location, x, y);
            return this;
        }
        set3i(x, y, z) {
            this.context.uniform3i(this.location, x, y, z);
            return this;
        }
        set4i(x, y, z, w) {
            this.context.uniform4i(this.location, x, y, z, w);
            return this;
        }
        set1fv(value) {
            this.context.uniform1fv(this.location, value);
            return this;
        }
        set2fv(value) {
            this.context.uniform2fv(this.location, value);
            return this;
        }
        set3fv(value) {
            this.context.uniform3fv(this.location, value);
            return this;
        }
        set4fv(value) {
            this.context.uniform4fv(this.location, value);
            return this;
        }
        set1iv(value) {
            this.context.uniform1iv(this.location, value);
            return this;
        }
        set2iv(value) {
            this.context.uniform2iv(this.location, value);
            return this;
        }
        set3iv(value) {
            this.context.uniform3iv(this.location, value);
            return this;
        }
        set4iv(value) {
            this.context.uniform4iv(this.location, value);
            return this;
        }
        setMatrix2fv(value, transpose = false) {
            this.context.uniformMatrix2fv(this.location, transpose, value);
            return this;
        }
        setMatrix3fv(value, transpose = false) {
            this.context.uniformMatrix3fv(this.location, transpose, value);
            return this;
        }
        setMatrix4fv(value, transpose = false) {
            this.context.uniformMatrix4fv(this.location, transpose, value);
            return this;
        }
    }
    Lucide.UniformSetter = UniformSetter;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    class View {
        constructor(gl, program, material) {
            this.gl = gl;
            this.program = program;
            this.material = material;
            this.matrix = mat4.create();
            this.program.registerMesh(this.material.mesh);
            this.program.registerTextures(this.material.textures);
            this.mvpMatrixSetter = this.program.createUniformSetter("mvpMatrix");
            this.invMatrixSetter = this.program.createUniformSetter("invMatrix");
        }
        reset() {
            mat4.identity(this.matrix);
        }
        translate(vector) {
            mat4.translate(this.matrix, this.matrix, vector);
        }
        rotate(radian, axis) {
            mat4.rotate(this.matrix, this.matrix, radian, axis);
        }
        scale(value) {
            mat4.scale(this.matrix, this.matrix, value);
        }
        render(vp) {
            var mvp = mat4.create();
            var inv = mat4.create();
            mat4.multiply(mvp, vp, this.matrix);
            mat4.invert(inv, this.matrix);
            this.mvpMatrixSetter.setMatrix4fv(mvp);
            this.invMatrixSetter.setMatrix4fv(inv);
            var mesh = this.material.mesh;
            mesh.index.bind();
            this.gl.drawElements(mesh.type, mesh.index.size, this.gl.UNSIGNED_SHORT, 0);
        }
    }
    Lucide.View = View;
})(Lucide || (Lucide = {}));
//# sourceMappingURL=lucide.js.map
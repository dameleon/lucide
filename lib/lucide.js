var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lucide;
(function (Lucide) {
    var AttributeSetter = (function (_super) {
        __extends(AttributeSetter, _super);
        function AttributeSetter(context, location) {
            _super.call(this, context);
            this.location = location;
            this.context.enableVertexAttribArray(this.location);
        }
        AttributeSetter.prototype.setValue = function (size, value, usage) {
            return this.set(new Lucide.VertexBufferObject(this.context, size, value, usage));
        };
        AttributeSetter.prototype.set = function (vbo) {
            vbo.bind();
            this.context.vertexAttribPointer(this.location, vbo.size, this.context.FLOAT, false, 0, 0);
            return this;
        };
        return AttributeSetter;
    }(Lucide.Context));
    Lucide.AttributeSetter = AttributeSetter;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var BufferObject = (function (_super) {
        __extends(BufferObject, _super);
        function BufferObject(context, value, usage) {
            _super.call(this, context);
            this.usage = usage;
            this.buffer = this.context.createBuffer();
        }
        BufferObject.prototype.initialize = function (value) {
            this.bind();
            this.setData(value);
            this.unbind();
        };
        BufferObject.prototype.setData = function (value) {
            this.context.bufferData(this.target, value, this.usage);
        };
        BufferObject.prototype.bind = function () {
            this.context.bindBuffer(this.target, this.buffer);
        };
        BufferObject.prototype.unbind = function () {
            this.context.bindBuffer(this.target, null);
        };
        return BufferObject;
    }(Lucide.Context));
    var VertexBufferObject = (function (_super) {
        __extends(VertexBufferObject, _super);
        function VertexBufferObject(context, size, value, usage) {
            if (usage === void 0) { usage = context.STATIC_DRAW; }
            _super.call(this, context, value, usage);
            this.size = size;
            this.usage = usage;
            this.target = this.context.ARRAY_BUFFER;
            this.initialize(value);
        }
        return VertexBufferObject;
    }(BufferObject));
    Lucide.VertexBufferObject = VertexBufferObject;
    var IndexBufferObject = (function (_super) {
        __extends(IndexBufferObject, _super);
        function IndexBufferObject(context, value, usage) {
            if (usage === void 0) { usage = context.STATIC_DRAW; }
            _super.call(this, context, value, usage);
            this.usage = usage;
            this.target = this.context.ELEMENT_ARRAY_BUFFER;
            this.size = value.length;
            this.initialize(value);
        }
        return IndexBufferObject;
    }(BufferObject));
    Lucide.IndexBufferObject = IndexBufferObject;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var Context = (function () {
        function Context(context) {
            this.context = context;
        }
        return Context;
    }());
    Lucide.Context = Context;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var Factory = (function () {
        function Factory(context) {
            this.context = context;
        }
        Factory.prototype.Program = function (vertexShader, fragmentShader) {
            return new Lucide.Program(this.context, vertexShader, fragmentShader);
        };
        Factory.prototype.VertexShader = function (content) {
            return this.Shader(this.context.VERTEX_SHADER, content);
        };
        Factory.prototype.FragmentShader = function (content) {
            return this.Shader(this.context.FRAGMENT_SHADER, content);
        };
        Factory.prototype.Shader = function (type, content) {
            var shader = this.context.createShader(type);
            this.context.shaderSource(shader, content);
            this.context.compileShader(shader);
            if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
                throw new Error(this.context.getShaderInfoLog(shader));
            }
            return shader;
        };
        Factory.prototype.Texture = function (unit) {
            if (unit === void 0) { unit = 0; }
            return new Lucide.Texture(this.context, unit);
        };
        Factory.prototype.VertexBufferObject = function (size, value, usage) {
            return new Lucide.VertexBufferObject(this.context, size, value, usage);
        };
        Factory.prototype.IndexBufferObject = function (value, usage) {
            return new Lucide.IndexBufferObject(this.context, value, usage);
        };
        return Factory;
    }());
    Lucide.Factory = Factory;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var GL = (function (_super) {
        __extends(GL, _super);
        function GL(canvas) {
            _super.call(this, canvas.getContext("experimental-webgl"));
            this.clearColor = [0.0, 0.0, 0.0, 0.0];
            this.clearDepth = 1.0;
            this.clearFlag = (this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
            this.Factory = new Lucide.Factory(this.context);
        }
        GL.prototype.clear = function () {
            this.context.clearColor.apply(this.context, this.clearColor);
            this.context.clearDepth(this.clearDepth);
            this.context.clear(this.clearFlag);
        };
        GL.prototype.flush = function () {
            this.context.flush();
        };
        GL.prototype.drawArrays = function (mode, vbo, first) {
            if (first === void 0) { first = 0; }
            vbo.bind();
            this.context.drawArrays(mode, first, vbo.size);
        };
        GL.prototype.drawElements = function (mode, ibo, type, offset) {
            if (type === void 0) { type = this.context.UNSIGNED_SHORT; }
            if (offset === void 0) { offset = 0; }
            ibo.bind();
            this.context.drawElements(mode, ibo.size, type, offset);
        };
        GL.prototype.exec = function (target) {
            target(this.context);
        };
        return GL;
    }(Lucide.Context));
    Lucide.GL = GL;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var Material = (function () {
        function Material(mesh) {
            var textures = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                textures[_i - 1] = arguments[_i];
            }
            this.mesh = mesh;
            this.textures = textures;
        }
        return Material;
    }());
    Lucide.Material = Material;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var Mesh = (function (_super) {
        __extends(Mesh, _super);
        function Mesh(context, position, index, normal, texture, color) {
            _super.call(this, context);
            this.usage = this.context.STATIC_DRAW;
            this.type = this.context.TRIANGLES;
            this.size = 3;
            this.initialize(position, index, normal, texture, color);
        }
        Mesh.prototype.initialize = function (position, index, normal, texture, color) {
            this.position = new Lucide.VertexBufferObject(this.context, this.size, position, this.usage);
            this.index = new Lucide.IndexBufferObject(this.context, index, this.usage);
            !normal || (this.normal = new Lucide.VertexBufferObject(this.context, this.size, normal, this.usage));
            !color || (this.color = new Lucide.VertexBufferObject(this.context, this.size, color, this.usage));
            !texture || (this.texture = new Lucide.VertexBufferObject(this.context, 2, texture, this.usage));
        };
        return Mesh;
    }(Lucide.Context));
    Lucide.Mesh = Mesh;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var Program = (function (_super) {
        __extends(Program, _super);
        function Program(context, vertexShader, fragmentShader) {
            _super.call(this, context);
            this.attributeMap = {
                "position": "position",
                "color": "color",
                "normal": "normal",
                "texture": "texCoord",
            };
            this.program = this.context.createProgram();
            this.linkShaders(vertexShader, fragmentShader);
        }
        Program.prototype.registerMesh = function (mesh) {
            var _this = this;
            Object.keys(this.attributeMap).forEach(function (key) {
                if (mesh[key] != undefined) {
                    console.log(mesh[key]);
                    _this.createAttributeSetter(_this.attributeMap[key]).set(mesh[key]);
                }
            });
        };
        Program.prototype.registerTextures = function (textures) {
            var _this = this;
            textures.forEach(function (tex) {
                _this.createUniformSetter("texture" + tex.unit).set1i(tex.unit);
            });
        };
        Program.prototype.createAttributeSetter = function (name) {
            return new Lucide.AttributeSetter(this.context, this.context.getAttribLocation(this.program, name));
        };
        Program.prototype.createUniformSetter = function (name) {
            return new Lucide.UniformSetter(this.context, this.context.getUniformLocation(this.program, name));
        };
        Program.prototype.linkShaders = function (vertexShader, fragmentShader) {
            this.vertexShader = vertexShader;
            this.fragmentShader = fragmentShader;
            this.context.attachShader(this.program, this.vertexShader);
            this.context.attachShader(this.program, this.fragmentShader);
            this.context.linkProgram(this.program);
            if (!this.context.getProgramParameter(this.program, this.context.LINK_STATUS)) {
                throw new Error(this.context.getProgramInfoLog(this.program));
            }
            this.context.useProgram(this.program);
        };
        return Program;
    }(Lucide.Context));
    Lucide.Program = Program;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var Texture = (function (_super) {
        __extends(Texture, _super);
        function Texture(context, unit) {
            _super.call(this, context);
            this.unit = unit;
            this.texture = this.context.createTexture();
            this.index = this.context.TEXTURE0 + unit;
        }
        Texture.prototype.set = function (content, createsMitmap, level, internalFormat, format, type) {
            if (createsMitmap === void 0) { createsMitmap = true; }
            if (level === void 0) { level = 0; }
            if (internalFormat === void 0) { internalFormat = this.context.RGBA; }
            if (format === void 0) { format = this.context.RGBA; }
            if (type === void 0) { type = this.context.UNSIGNED_BYTE; }
            this.bind();
            this.context.texImage2D(this.context.TEXTURE_2D, level, internalFormat, format, type, content);
            if (createsMitmap) {
                this.context.generateMipmap(this.context.TEXTURE_2D);
            }
            this.unbind();
        };
        Texture.prototype.bind = function () {
            this.context.activeTexture(this.index);
            this.context.bindTexture(this.context.TEXTURE_2D, this.texture);
        };
        Texture.prototype.unbind = function () {
            this.context.bindTexture(this.context.TEXTURE_2D, null);
        };
        return Texture;
    }(Lucide.Context));
    Lucide.Texture = Texture;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var UniformSetter = (function (_super) {
        __extends(UniformSetter, _super);
        function UniformSetter(context, location) {
            _super.call(this, context);
            this.location = location;
        }
        UniformSetter.prototype.set1f = function (x) {
            this.context.uniform1f(this.location, x);
            return this;
        };
        UniformSetter.prototype.set2f = function (x, y) {
            this.context.uniform2f(this.location, x, y);
            return this;
        };
        UniformSetter.prototype.set3f = function (x, y, z) {
            this.context.uniform3f(this.location, x, y, z);
            return this;
        };
        UniformSetter.prototype.set4f = function (x, y, z, w) {
            this.context.uniform4f(this.location, x, y, z, w);
            return this;
        };
        UniformSetter.prototype.set1i = function (x) {
            this.context.uniform1i(this.location, x);
            return this;
        };
        UniformSetter.prototype.set2i = function (x, y) {
            this.context.uniform2i(this.location, x, y);
            return this;
        };
        UniformSetter.prototype.set3i = function (x, y, z) {
            this.context.uniform3i(this.location, x, y, z);
            return this;
        };
        UniformSetter.prototype.set4i = function (x, y, z, w) {
            this.context.uniform4i(this.location, x, y, z, w);
            return this;
        };
        UniformSetter.prototype.set1fv = function (value) {
            this.context.uniform1fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set2fv = function (value) {
            this.context.uniform2fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set3fv = function (value) {
            this.context.uniform3fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set4fv = function (value) {
            this.context.uniform4fv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set1iv = function (value) {
            this.context.uniform1iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set2iv = function (value) {
            this.context.uniform2iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set3iv = function (value) {
            this.context.uniform3iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.set4iv = function (value) {
            this.context.uniform4iv(this.location, value);
            return this;
        };
        UniformSetter.prototype.setMatrix2fv = function (value, transpose) {
            if (transpose === void 0) { transpose = false; }
            this.context.uniformMatrix2fv(this.location, transpose, value);
            return this;
        };
        UniformSetter.prototype.setMatrix3fv = function (value, transpose) {
            if (transpose === void 0) { transpose = false; }
            this.context.uniformMatrix3fv(this.location, transpose, value);
            return this;
        };
        UniformSetter.prototype.setMatrix4fv = function (value, transpose) {
            if (transpose === void 0) { transpose = false; }
            this.context.uniformMatrix4fv(this.location, transpose, value);
            return this;
        };
        return UniformSetter;
    }(Lucide.Context));
    Lucide.UniformSetter = UniformSetter;
})(Lucide || (Lucide = {}));
var Lucide;
(function (Lucide) {
    var View = (function () {
        function View(gl, program, material) {
            this.gl = gl;
            this.program = program;
            this.material = material;
            this.matrix = mat4.create();
            this.program.registerMesh(this.material.mesh);
            this.program.registerTextures(this.material.textures);
            this.mvpMatrixSetter = this.program.createUniformSetter("mvpMatrix");
            this.invMatrixSetter = this.program.createUniformSetter("invMatrix");
        }
        View.prototype.reset = function () {
            mat4.identity(this.matrix);
        };
        View.prototype.translate = function (vector) {
            mat4.translate(this.matrix, this.matrix, vector);
        };
        View.prototype.rotate = function (radian, axis) {
            mat4.rotate(this.matrix, this.matrix, radian, axis);
        };
        View.prototype.scale = function (value) {
            mat4.scale(this.matrix, this.matrix, value);
        };
        View.prototype.render = function (vp) {
            var mvp = mat4.create();
            var inv = mat4.create();
            mat4.multiply(mvp, vp, this.matrix);
            mat4.invert(inv, this.matrix);
            this.mvpMatrixSetter.setMatrix4fv(mvp);
            this.invMatrixSetter.setMatrix4fv(inv);
            var mesh = this.material.mesh;
            mesh.index.bind();
            this.gl.drawElements(mesh.type, mesh.index.size, this.gl.UNSIGNED_SHORT, 0);
        };
        return View;
    }());
    Lucide.View = View;
})(Lucide || (Lucide = {}));
//# sourceMappingURL=lucide.js.map
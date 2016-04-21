(function(global, undefined) {
    var document = global.document;
    var img = new Image();

    function init() {
        var canvas = document.querySelector("#gl");
        var vShaderElm = document.querySelector("#v-shader");
        var fShaderElm = document.querySelector("#f-shader");
        var sp = sphere(32, 32, 1.0);

        console.log(sp);

        var gl = new Lucide.Gl(canvas);
        var pos = gl.createVBO(3, new Float32Array(sp.p));
        var color = gl.createVBO(3, new Float32Array(sp.c));
        var normal = gl.createVBO(3, new Float32Array(sp.n));
        var tex = gl.createVBO(2, new Float32Array(sp.t));
        var ibo = gl.createIBO(new Int16Array(sp.i));
        var texture = gl.createTexture();

        texture.set(img);

        var program = gl.createProgram(
            gl.createVertexShader(vShaderElm.textContent),
            gl.createFragmentShader(fShaderElm.textContent)
        );
        program.createAttributeSetter('position').set(pos);
        program.createAttributeSetter('color').set(color);
        program.createAttributeSetter('normal').set(normal);
        program.createAttributeSetter('texCoord').set(tex);
        var matrixSetter = program.createUniformSetter('mvpMatrix');
        var invSetter = program.createUniformSetter('invMatrix');
        program.createUniformSetter('lightDirection').set3fv(new Float32Array([1.0, 1.0, 1.0]));
        program.createUniformSetter('eyePosition').set3fv(new Float32Array([1.0, 1.0, 1.0]));
        program.createUniformSetter('centerPoint').set3fv(new Float32Array([0.0, 0.0, 0.0]));
        program.createUniformSetter('texture').set1i(0);

        console.log(texture, gl.context.TEXTURE0);

        var m = new matIV();
        var mMatrix = m.identity(m.create());
        var vMatrix = m.identity(m.create());
        var pMatrix = m.identity(m.create());
        var tmpMatrix = m.identity(m.create());
        var mvpMatrix = m.identity(m.create());
        var invMatrix = m.identity(m.create());

        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, canvas.width / canvas.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);

        var count = 0;

        gl.exec(function(gl) {
            console.log(gl.getParameter(gl.MAX_TEXTURE_SIZE));
        });

        function render() {
            count++;
            gl.clear();
            var rad = (count % 360) * Math.PI / 180;

            m.identity(mMatrix);
            m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
            m.multiply(tmpMatrix, mMatrix, mvpMatrix);
            m.inverse(mMatrix, invMatrix);
            matrixSetter.setMatrix4fv(mvpMatrix);
            invSetter.setMatrix4fv(invMatrix);

            gl.drawElements(gl.context.TRIANGLES, ibo);
            gl.flush();

            requestAnimationFrame(render);
        }
        render();
    }

    document.addEventListener("DOMContentLoaded", function() {
        new Promise(function(resolve, reject) {
            img.src = "/texture.jpg";
            img.onload = resolve;
            img.onerror = reject;
        }).then(function() {
            console.log(img);
            init();
        });
    });

})(this, void 0);
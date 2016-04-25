(function(global, undefined) {
    var document = global.document;
    var img1 = new Image();
    var img2 = new Image();

    function init() {
        var canvas = document.querySelector("#gl");
        var vShaderElm = document.querySelector("#v-shader");
        var fShaderElm = document.querySelector("#f-shader");
        var sp = sphere(32, 32, 1.0);

        var gl = new Lucide.GL(canvas);

        gl.exec(function(gl) {
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.depthFunc(gl.LEQUAL);
        });

        var texture0 = gl.Factory.Texture(0);
        var texture1 = gl.Factory.Texture(1);

        texture0.set(img1);
        texture1.set(img2);

        var mesh = gl.Factory.Mesh(
            new Float32Array(sp.p),
            new Int16Array(sp.i),
            new Float32Array(sp.t),
            new Float32Array(sp.c),
            new Float32Array(sp.n)
        );
        var material = gl.Factory.Material(mesh, texture0, texture1);
        var program = gl.Factory.Program(
            gl.Factory.VertexShader(vShaderElm.textContent),
            gl.Factory.FragmentShader(fShaderElm.textContent)
        );

        var view = new Lucide.View(gl.context, program, material);

        program.createUniformSetter('lightDirection').set3fv(new Float32Array([1.0, 1.0, 1.0]));
        program.createUniformSetter('eyePosition').set3fv(new Float32Array([1.0, 1.0, 1.0]));
        program.createUniformSetter('centerPoint').set3fv(new Float32Array([0.0, 0.0, 0.0]));

        var m = new matIV();
        var vMatrix = m.identity(m.create());
        var pMatrix = m.identity(m.create());
        var tmpMatrix = m.identity(m.create());

        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, canvas.width / canvas.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);

        var count = 0;

        texture0.bind();
        texture1.bind();

        function render() {
            count++;
            var rad = (count % 360) * Math.PI / 180;

            gl.clear();
            view.reset();
            view.rotate(rad, [0, 1, 0]);
            view.render(tmpMatrix);
            gl.flush();
            requestAnimationFrame(render);
        }
        render();
    }

    document.addEventListener("DOMContentLoaded", function() {
        var p1 = new Promise(function(resolve, reject) {
            img1.src = "/texture0.png";
            img1.onload = resolve;
            img1.onerror = reject;
        });
        var p2 = new Promise(function(resolve, reject) {
            img2.src = "/texture1.png";
            img2.onload = resolve;
            img2.onerror = reject;
        });

        Promise.all([p1, p2]).then(function() {
            init();
        });
    });

})(this, void 0);
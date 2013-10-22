
function Interpolate(x0,x1,alpha) {
    return x0 * (1 - alpha) + alpha * x1;
}
	
function GenerateSmoothNoise(baseNoise,width,height,octave,smoothNoise) {
	var samplePeriod = 1 << octave; // calculates 2 ^ k
    var sampleFrequency = 1.0 / samplePeriod;
	var k = 0;
	for (var j = 0; j < height; j++) {
               // calculate the vertical sampling indices
        var sample_j0 = (j / samplePeriod) * samplePeriod;
        var sample_j1 = (sample_j0 + samplePeriod) % height; // wrap
                // around
        var vertical_blend = (j - sample_j0) * sampleFrequency;
		for (var i = 0; i < width; i++) {
				// calculate the horizontal sampling indices
			var sample_i0 = (i / samplePeriod) * samplePeriod;
			var sample_i1 = (sample_i0 + samplePeriod) % width; // wrap around
			var horizontal_blend = (i - sample_i0) * sampleFrequency;
                // blend the top two corners
			var top = Interpolate(baseNoise[sample_i0+sample_j0*width], baseNoise[sample_i1+sample_j0*width],
                        horizontal_blend);
                // blend the bottom two corners
			var bottom = Interpolate(baseNoise[sample_i0+sample_j1*width], baseNoise[sample_i1+sample_j1*width],
						horizontal_blend);
            smoothNoise[k++]=(Interpolate(top, bottom, vertical_blend));
        }
    }
}

function GeneratePerlinNoise(baseNoise, width,height,octaveLow, octaveHigh) {
        var persistance = 0.5;
        var perlinNoise = [], sm = []
		for (var i=0; i<width*height; i++) {
			perlinNoise.push(0);
			sm.push(0);
		}
        var amplitude = 1.0;
        var totalAmplitude = 0.0;
        // blend noise together
        for (var octave = octaveHigh; octave >= octaveLow; octave--) {
			GenerateSmoothNoise(baseNoise,width,height,i,sm);
            amplitude *= persistance;
            totalAmplitude += amplitude;
            for (var i=0; i<perlinNoise.length; i++) {
                perlinNoise[i] += sm[i] * amplitude;
            }
        }
        // normalisation
        for (var i = 0; i < perlinNoise.length; i++) {
            perlinNoise[i] /= totalAmplitude;
        }
        return perlinNoise;
    }
	
function GenerateRandom(width,height) {
	var x = [];
	for (var i=0;i<width*height;i++)
		x.push(Math.random());
	return GeneratePerlinNoise(x, width, height, 3, 4);
}
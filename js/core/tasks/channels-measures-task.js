/*
    Sound card Oscilloscope | Spectrum Analyzer | Signal Generator
    Copyright(C) 2025  Franck Gaspoz
    find license and copyright informations in files /COPYRIGHT and /LICENCE
*/

// compute measures for channels from data buffer

channelsMeasuresTask = {

    run() {
        oscilloscope.channels.forEach(channel => {
            if (channel.measures.dataArray != null)
                this.compute(channel);
        });
    },

    compute(channel) {
        // compute properties from the data buffer
        const m = channel.measures;
        const d = m.dataArray;
        const f = m.fftDataArray;

        // V instant
        channel.measures.setValue(channel, d[0]);

        // V min/max/avg
        var vMin = Number.MAX_VALUE;
        var vMax = Number.MIN_VALUE;
        var vAvg = 0;
        for (var i = 0; i < d.length; i++) {
            const v = d[i];
            vAvg += v;
            vMin = Math.min(vMin, v);
            vMax = Math.max(vMax, v);
        }
        if (d.length > 0)
            vAvg /= d.length;

        // frequency ins, min, max
        var pwdf = -Number.MAX_VALUE
        var pwdi = null
        var mini = null
        var maxi = null

        var mindb = Number.MAX_VALUE
        var maxdb = -Number.MAX_VALUE

        var n = f.length
        if (f != null) {
            for (var i = 0; i < n; i++) {
                const v = f[i];
                // max
                if (v > pwdf) {
                    pwdf = v
                    pwdi = i
                }
                if (v >= maxdb) maxdb = v
                if (v <= mindb) mindb = v
            }
            for (var i = 0; i < n; i++) {
                const v = f[i];
                if (v > m.minDb && v < m.maxDb && mini == null) {
                    mini = i
                    break
                }
            }
            for (var i = n - 1; i >= 0; i--) {
                const v = f[i];
                if (v > m.minDb && v < m.maxDb && maxi == null) {
                    maxi = i
                    break
                }
            }
        }

        const rt = n > 0 ? m.sampleRate / n : 0
        var drt = rt / 2.0

        const frq = drt * (pwdi + 0)
        const minFrq = drt * (mini + 0)
        const maxFrq = drt * (maxi + 0)

        if (vMin == Number.MAX_VALUE) vMin = 0
        if (vMax == Number.MIN_VALUE) vMax = 0

        channel.measures.setMeasures(
            channel,
            vMin,
            vMax,
            vAvg,
            frq,
            minFrq,
            maxFrq);
    }
}
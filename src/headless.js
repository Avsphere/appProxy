// $(function() {
//   const configData = configDiscoveryData;
//
//   function geometricPattern() {
//     //some borrowed pattern
//     var c = document.getElementsByTagName('canvas')[0],
//         x = c.getContext('2d'),
//         pr = window.devicePixelRatio || 1,
//         w = window.innerWidth,
//         h = window.innerHeight,
//         f = 90,
//         q,
//         m = Math,
//         r = 0,
//         u = m.PI*2,
//         v = m.cos,
//         z = m.random
//     c.width = w*pr
//     c.height = h*pr
//     x.scale(pr, pr)
//     x.globalAlpha = 0.6
//     function i(){
//         x.clearRect(0,0,w,h)
//         q=[{x:0,y:h*.7+f},{x:0,y:h*.7-f}]
//         while(q[1].x<w+f) d(q[0], q[1])
//     }
//     function d(i,j){
//         x.beginPath()
//         x.moveTo(i.x, i.y)
//         x.lineTo(j.x, j.y)
//         var k = j.x + (z()*2-0.25)*f,
//             n = y(j.y)
//         x.lineTo(k, n)
//         x.closePath()
//         r-=u/-50
//         x.fillStyle = '#'+(v(r)*127+128<<16 | v(r+u/3)*127+128<<8 | v(r+u/3*2)*127+128).toString(16)
//         x.fill()
//         q[0] = q[1]
//         q[1] = {x:k,y:n}
//     }
//     function y(p){
//         var t = p + (z()*2-1.1)*f
//         return (t>h||t<0) ? y(p) : t
//     }
//     document.onclick = i
//     i();
//   }
//   function init() {
//
//     geometricPattern();
//     $('#customFile').on('change', function() {
//       if ( document.getElementById('customFile').files.length === 1 ) {
//         let reader = new FileReader();
//         reader.onload = function(e) {
//           let jsonData = reader.result;
//           processData( jsonData );
//         }
//         reader.readAsText( document.getElementById('customFile').files[0] )
//       } else {
//         console.log("it appears the value is unchanged");
//       }
//     })
//   }
//   function processData( configData ) {
//     let parsedData = JSON.parse(configData);
//     let configApi = new ConfigApi(parsedData);
//     let analyzer = new WindowsAnalysis( configApi );
//     let viewBuilder = new ViewBuilder( analyzer.results )
//     viewBuilder.buildHeadlessView()
//   }
//
//
//
//   init();
// })

class Headless {
  constructor() {
    this.geometricPattern();
    this.handles();
  }
  processData( configData ){
    let parsedData = JSON.parse(configData);
    let configApi = new ConfigApi(parsedData);
    let analyzer = new WindowsAnalysis( configApi );
    let viewBuilder = new ViewBuilder( analyzer.results )
    viewBuilder.buildHeadlessView()
  }
  handles(){
    let that = this;
    $('#customFile').on('change', function() {
      if ( document.getElementById('customFile').files.length === 1 ) {
        let reader = new FileReader();
        reader.onload = function(e) {
          let jsonData = reader.result;
          that.processData( jsonData );
        }
        reader.readAsText( document.getElementById('customFile').files[0] )
      } else {
        console.log("it appears the value is unchanged");
      }
    })
  }
  geometricPattern() {
    //some borrowed pattern
    var c = document.getElementsByTagName('canvas')[0],
        x = c.getContext('2d'),
        pr = window.devicePixelRatio || 1,
        w = window.innerWidth,
        h = window.innerHeight,
        f = 90,
        q,
        m = Math,
        r = 0,
        u = m.PI*2,
        v = m.cos,
        z = m.random
    c.width = w*pr
    c.height = h*pr
    x.scale(pr, pr)
    x.globalAlpha = 0.6
    function i(){
        x.clearRect(0,0,w,h)
        q=[{x:0,y:h*.7+f},{x:0,y:h*.7-f}]
        while(q[1].x<w+f) d(q[0], q[1])
    }
    function d(i,j){
        x.beginPath()
        x.moveTo(i.x, i.y)
        x.lineTo(j.x, j.y)
        var k = j.x + (z()*2-0.25)*f,
            n = y(j.y)
        x.lineTo(k, n)
        x.closePath()
        r-=u/-50
        x.fillStyle = '#'+(v(r)*127+128<<16 | v(r+u/3)*127+128<<8 | v(r+u/3*2)*127+128).toString(16)
        x.fill()
        q[0] = q[1]
        q[1] = {x:k,y:n}
    }
    function y(p){
        var t = p + (z()*2-1.1)*f
        return (t>h||t<0) ? y(p) : t
    }
    document.onclick = i
    i();
  }



}

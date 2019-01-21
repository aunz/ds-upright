

navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    .then(function (stream) {
      const player = document.getElementById('player')
      player.srcObject = stream
      player.hidden = true
      player.play()
      window.player = player

      const w = 320
      const h = w * 3 / 4
      const canvas = document.getElementById("myCanvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      setInterval(() => {
        ctx.drawImage(player, 0, 0, w, h)
      }, 100)
    })

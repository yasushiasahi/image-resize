import React, { useCallback, useRef, useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'

const spanStyle = {
  position: 'absolute',
  width: '10px',
  height: '10px',
  background: 'blue',
}

function App() {
  const [canvasAttr, setCanvasAtttr] = useState({ width: 0, height: 0 })
  const [divStyle, setDivStyle] = useState({
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  })
  const currentSpanRef = useRef('')
  const imageRef = useRef(null)
  const canvasRef = useRef()

  const handlefileChange = useCallback(e => {
    const file = e.currentTarget.files[0]
    const image = new Image()
    const reader = new FileReader()

    reader.onload = ev => {
      image.onload = () => {
        imageRef.current = image

        setCanvasAtttr({
          width: image.width,
          height: image.height,
        })

        const ctx = canvasRef.current.getContext('2d')

        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          0,
          0,
          image.width,
          image.height,
        )

        if (image.height >= image.width) {
          const hoge = (image.height - image.width * 0.666666667) / 2
          setDivStyle({
            top: hoge + 'px',
            right: '0px',
            bottom: hoge + 'px',
            left: '0px',
          })
        } else {
          const hoge = (image.width - image.height * 1.666666667) / 2
          setDivStyle({
            top: '0px',
            right: hoge + '0px',
            bottom: '0px',
            left: hoge + '0px',
          })
        }
      }

      image.src = ev.target.result
    }

    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(() => {
    const newCanvas = document.createElement('canvas')
    const ctx = newCanvas.getContext('2d')

    const { width, height } = imageRef.current
    const rect = Object.entries(divStyle).reduce((acc, [key, value]) => {
      return { ...acc, ...{ [key]: +value.slice(0, -2) } }
    }, {})

    const sx = rect.left
    const sy = rect.top
    const sWidth = width - rect.left - rect.right
    const sHeight = height - rect.top - rect.bottom

    newCanvas.width = 600
    newCanvas.height = 400

    console.log({ sx, sy, sWidth, sHeight })

    ctx.drawImage(imageRef.current, sx, sy, sWidth, sHeight, 0, 0, 600, 400)

    const base64 = newCanvas.toDataURL('image/jpeg')

    // base64から画像データを作成する
    let barr, bin, i, len
    bin = atob(base64.split('base64,')[1])
    len = bin.length
    barr = new Uint8Array(len)
    i = 0
    while (i < len) {
      barr[i] = bin.charCodeAt(i)
      i++
    }

    const blob = new Blob([barr], { type: 'image/jpeg' })

    const url = window.URL || window.webkitURL
    const dataUrl = url.createObjectURL(blob)
    const event = document.createEvent('MouseEvents')
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    )
    const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
    a.href = dataUrl
    a.download = 'resize'
    a.dispatchEvent(event)
  }, [divStyle])

  const handleMousemove = useCallback(
    e => {
      setDivStyle(prev => {
        const rect = Object.entries(prev).reduce((acc, [key, value]) => {
          return { ...acc, ...{ [key]: +value.slice(0, -2) } }
        }, {})

        const diff =
          Math.abs(e.movementX) > Math.abs(e.movementY)
            ? e.movementX
            : e.movementY

        switch (currentSpanRef.current) {
          case 'topLeft':
            rect.top = rect.top + diff * 0.666666667
            rect.left = rect.left + diff
            break
          case 'topRight':
            rect.top = rect.top - diff * 0.666666667
            rect.right = rect.right - diff
            break
          case 'bottomLeft':
            rect.bottom = rect.bottom + diff * 0.666666667
            rect.left = rect.left + diff
            break
          case 'bottomRight':
            rect.bottom = rect.bottom - diff * 0.666666667
            rect.right = rect.right - diff
            break
          default:
            break
        }

        return {
          top: rect.top + 'px',
          right: rect.right + 'px',
          bottom: rect.bottom + 'px',
          left: rect.left + 'px',
        }
      })
    },
    [currentSpanRef],
  )

  const handleSpanMousedown = useCallback(
    which => e => {
      currentSpanRef.current = which
      document.addEventListener('mousemove', handleMousemove)
    },
    [handleMousemove, currentSpanRef],
  )

  const handleDivMousemove = useCallback(e => {
    setDivStyle(prev => {
      const rect = Object.entries(prev).reduce((acc, [key, value]) => {
        return { ...acc, ...{ [key]: +value.slice(0, -2) } }
      }, {})

      return {
        top: `${rect.top + e.movementY}px`,
        right: `${rect.right - e.movementX}px`,
        bottom: `${rect.bottom - e.movementY}px`,
        left: `${rect.left + e.movementX}px`,
      }
    })
  }, [])

  const handleDivMousedown = useCallback(
    e => {
      if (e.target.dataset.js === 'div') {
        document.addEventListener('mousemove', handleDivMousemove)
      }
    },
    [handleDivMousemove],
  )
  const handleDivMouseUp = useCallback(
    e => {
      if (e.target.dataset.js === 'div') {
        document.removeEventListener('mousemove', handleDivMousemove)
      }
    },
    [handleDivMousemove],
  )

  useEffect(() => {
    const handleMouseup = () => {
      document.removeEventListener('mousemove', handleMousemove)
    }
    document.addEventListener('mouseup', handleMouseup)

    return () => {
      document.removeEventListener('mouseup', handleMouseup)
    }
  }, [handleMousemove])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>画像リサイズデモ</h1>
        <p>
          <input type="file" accept="image/*" onChange={handlefileChange} />
        </p>
        <div
          style={{
            background: 'cyan',
            position: 'relative',
          }}
        >
          <canvas
            id="canvas"
            ref={canvasRef}
            {...canvasAttr}
            style={{ background: 'lime', display: 'block' }}
          />
          {!!imageRef.current && (
            <div
              data-js="div"
              onMouseDownCapture={handleDivMousedown}
              onMouseUp={handleDivMouseUp}
              style={{
                ...{
                  position: 'absolute',
                  background: 'lightpink',
                  opacity: '.5',
                },
                ...divStyle,
              }}
            >
              <span
                style={{ ...spanStyle, ...{ top: '0', left: '0' } }}
                onMouseDown={handleSpanMousedown('topLeft')}
              />
              <span
                style={{ ...spanStyle, ...{ top: '0', right: '0' } }}
                onMouseDown={handleSpanMousedown('topRight')}
              />
              <span
                style={{ ...spanStyle, ...{ bottom: '0', left: '0' } }}
                onMouseDown={handleSpanMousedown('bottomLeft')}
              />
              <span
                style={{ ...spanStyle, ...{ bottom: '0', right: '0' } }}
                onMouseDown={handleSpanMousedown('bottomRight')}
              />
            </div>
          )}
        </div>
        {!!imageRef.current && (
          <p>
            <button onClick={handleSubmit}>JPEGを生成</button>
          </p>
        )}
      </header>
    </div>
  )
}

export default App

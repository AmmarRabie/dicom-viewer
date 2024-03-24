import React from "react" // import { withStyles, useTheme } from '@mui/styles';
import Stack from "@mui/material/Stack"
import LinearProgress from "@mui/material/LinearProgress"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import RefreshIcon from "@mui/icons-material/Refresh"
import ContrastIcon from "@mui/icons-material/Contrast"
import SearchIcon from "@mui/icons-material/Search"
import StraightenIcon from "@mui/icons-material/Straighten"
import "./DicomViewer.css"
import { App } from "dwv"
import CameraswitchIcon from "@mui/icons-material/Cameraswitch"

export interface DicomViewerProps {
  dcm_url: string
}

interface DicomViewerState {
  tools: {
    [k: string]: any
  }
  selectedTool: string
  loadProgress: number
  dataLoaded: boolean
  dwvApp?: App
  rotation: number
}

class DicomViewer extends React.Component<DicomViewerProps, DicomViewerState> {
  constructor(props: DicomViewerProps) {
    super(props)
    this.state = {
      tools: {
        ZoomAndPan: {},
        WindowLevel: {},
        Draw: {
          options: ["Ruler"],
        },
        Scroll: {},
      },
      selectedTool: "Select Tool",
      loadProgress: 0,
      dataLoaded: false,
      rotation: 0,
    }
  }

  render() {
    const { tools, loadProgress, dataLoaded, rotation } = this.state

    const handleToolChange = (newTool: string) => {
      if (newTool) {
        this.onChangeTool(newTool)
      }
    }
    const toolsButtons = Object.keys(tools).map(tool => {
      return (
        <ToggleButton
          value={tool}
          key={tool}
          title={tool}
          disabled={!dataLoaded || !this.canRunTool(tool)}
        >
          {this.getToolIcon(tool)}
        </ToggleButton>
      )
    })

    return (
      <div id="dwv">
        <LinearProgress variant="determinate" value={loadProgress} />
        <Stack direction="row" spacing={1} padding={1} justifyContent="center">
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={this.state.selectedTool}
            exclusive
            onChange={(event, tool) => handleToolChange(tool)}
          >
            {toolsButtons}
          </ToggleButtonGroup>

          <ToggleButton
            value={"rotate"}
            key={"rotate"}
            title={"Rotate"}
            onClick={this.rotate90}
          >
            {this.getToolIcon("Rotate")}
          </ToggleButton>

          <ToggleButton
            size="small"
            value="reset"
            title="Reset"
            disabled={!dataLoaded}
            onChange={this.onReset}
          >
            <RefreshIcon />
          </ToggleButton>
        </Stack>

        <div
          id="layerGroup0"
          className="layerGroup"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div id="dropBox"></div>
        </div>
      </div>
    )
  }

  componentWillUnmount() {
    this.state?.dwvApp?.reset()
  }

  componentDidMount() {
    // create app
    const app = new App()
    app.init({
      // binders: undefined,
      // defaultCharacterSet: undefined,
      viewOnFirstLoadItem: undefined,
      dataViewConfigs: {
        "*": [
          {
            divId: "layerGroup0",
            orientation: "coronal",
            // colourMap: undefined,
            // opacity: undefined,
          },
        ],
      },
      tools: this.state.tools,
    } as any)

    let nReceivedLoadError = 0
    let isFirstRender = false
    app.addEventListener("loadstart", (/*event*/) => {
      // reset flags
      isFirstRender = true
    })
    app.addEventListener("loadprogress", (event: any) => {
      this.setState({ loadProgress: event.loaded })
    })
    app.addEventListener("renderend", (/*event*/) => {
      if (isFirstRender) {
        isFirstRender = false
        // available tools
        let selectedTool = "ZoomAndPan"
        this.onChangeTool(selectedTool)
      }
    })
    app.addEventListener("load", (/*event*/) => {
      this.setState({ dataLoaded: true })
    })
    app.addEventListener("loadend", (/*event*/) => {
      if (nReceivedLoadError) {
        this.setState({ loadProgress: 0 })
        alert("Received errors during load. Check log for details.")
      }
    })
    app.addEventListener("loaderror", (event: any) => {
      console.error(event.error)
      console.error(event)
      ++nReceivedLoadError
    })

    app.addEventListener("keydown", (event: any) => {
      app.defaultOnKeydown(event)
    })
    window.addEventListener("resize", app.onResize)

    this.setState({ dwvApp: app })


    app.loadURLs([this.props.dcm_url])
  }

  rotate90 = () => {
    this.setState({ rotation: (this.state.rotation + 90) % 360 })
  }

  /**
   * Get the icon of a tool.
   *
   * @param {string} tool The tool name.
   * @returns {Icon} The associated icon.
   */
  getToolIcon = (tool: string) => {
    let res
    if (tool === "ZoomAndPan") {
      res = <SearchIcon />
    } else if (tool === "WindowLevel") {
      res = <ContrastIcon />
    } else if (tool === "Draw") {
      res = <StraightenIcon />
    } else if (tool === "Rotate") {
      res = <CameraswitchIcon />
    }
    return res
  }

  onChangeTool = (tool: string) => {
    if (this.state.dwvApp) {
      this.setState({ selectedTool: tool })
      this.state.dwvApp.setTool(tool)
      if (tool === "Draw") {
        this.onChangeShape("Ruler")
      }
    }
  }

  canRunTool = (tool: string) => {
    let res
    if (tool === "Scroll") {
      res = this.state.dwvApp?.canScroll()
    } else if (tool === "WindowLevel") {
      res = this.state.dwvApp?.canWindowLevel()
    } else {
      res = true
    }
    return res
  }

  /**
   * Handle a change draw shape event.
   * @param {string} shape The new shape name.
   */
  onChangeShape = (shape: string) => {
    if (this.state.dwvApp) {
      this.state.dwvApp.setToolFeatures({ shapeName: shape })
    }
  }

  /**
   * Handle a reset event.
   */
  onReset = () => {
    if (this.state.dwvApp) {
      this.state.dwvApp.resetDisplay()
    }
  }
} // DwvComponent

export default DicomViewer

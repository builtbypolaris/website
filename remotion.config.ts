import { Config } from '@remotion/cli/config'
import { enableTailwind } from '@remotion/tailwind-v4'

/**
 * Remotion requires its config at the project root (next to package.json).
 * The actual source — scenes, compositions, mockups, fonts, etc. — lives in
 * `.claude/skills/remotion/`. Everything Remotion reads (assets, entry point,
 * and the render output dir) is rooted there.
 */
Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration)
})

Config.setVideoImageFormat('jpeg')
Config.setPixelFormat('yuv420p')
Config.setCodec('h264')
Config.setPublicDir('./.claude/skills/out')
Config.setEntryPoint('./.claude/skills/remotion/index.ts')
Config.setOverwriteOutput(true)
Config.setChromiumOpenGlRenderer('angle')

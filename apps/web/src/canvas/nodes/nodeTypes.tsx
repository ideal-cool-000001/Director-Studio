import { CharacterNode } from './CharacterNode';
import { SceneNode } from './SceneNode';
import { StoryboardNode } from './StoryboardNode';
import { VideoNode } from './VideoNode';
import { ImageNode } from './ImageNode';
import { AudioNode } from './AudioNode';
import { TextNode } from './TextNode';
import { StyleNode } from './StyleNode';

export const nodeTypes = {
  character: CharacterNode,
  scene: SceneNode,
  storyboard: StoryboardNode,
  video: VideoNode,
  image: ImageNode,
  text: TextNode,
  audio: AudioNode,
  style: StyleNode,
};
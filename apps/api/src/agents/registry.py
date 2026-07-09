from src.agents.base_agent import BaseAgent
from src.agents.producer.agent import ProducerAgent
from src.agents.director.agent import DirectorAgent
from src.agents.screenwriter.agent import ScreenwriterAgent
from src.agents.character_designer.agent import CharacterDesignerAgent
from src.agents.scene_designer.agent import SceneDesignerAgent
from src.agents.storyboard_arranger.agent import StoryboardArrangerAgent
from src.agents.image_generator.agent import ImageGeneratorAgent
from src.agents.video_generator.agent import VideoGeneratorAgent
from src.agents.audio_producer.agent import AudioProducerAgent
from src.agents.editor.agent import EditorAgent
from src.agents.promotion.agent import PromotionAgent


class AgentRegistry:
    _agents: dict[str, type[BaseAgent]] = {}

    @classmethod
    def register(cls, agent_type: str, agent_class: type[BaseAgent]) -> None:
        cls._agents[agent_type] = agent_class

    @classmethod
    def get(cls, agent_type: str) -> type[BaseAgent]:
        if agent_type not in cls._agents:
            raise ValueError(f"未知的 Agent 类型: {agent_type}")
        return cls._agents[agent_type]

    @classmethod
    def create(cls, agent_type: str) -> BaseAgent:
        agent_class = cls.get(agent_type)
        return agent_class()

    @classmethod
    def list_agents(cls) -> list[str]:
        return list(cls._agents.keys())


AgentRegistry.register("producer", ProducerAgent)
AgentRegistry.register("director", DirectorAgent)
AgentRegistry.register("screenwriter", ScreenwriterAgent)
AgentRegistry.register("character_designer", CharacterDesignerAgent)
AgentRegistry.register("scene_designer", SceneDesignerAgent)
AgentRegistry.register("storyboard_arranger", StoryboardArrangerAgent)
AgentRegistry.register("image_generator", ImageGeneratorAgent)
AgentRegistry.register("video_generator", VideoGeneratorAgent)
AgentRegistry.register("audio_producer", AudioProducerAgent)
AgentRegistry.register("editor", EditorAgent)
AgentRegistry.register("promotion", PromotionAgent)
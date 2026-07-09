from typing import Dict, Any, List

from src.agents.base_agent import BaseAgent, AgentResult


class StoryboardArrangerAgent(BaseAgent):
    agent_type: str = "storyboard_arranger"
    description: str = "分镜编排Agent：编排分镜和镜头设计"

    async def execute(self, node_id: str, context: Dict[str, Any]) -> AgentResult:
        action = context.get("action", "arrange")

        if action == "arrange":
            return await self._arrange_storyboard(context)
        elif action == "analyze_shots":
            return await self._analyze_shots(context)
        else:
            return AgentResult(
                success=False,
                error=f"未知操作: {action}",
            )

    async def _arrange_storyboard(self, context: Dict[str, Any]) -> AgentResult:
        try:
            script_content = context.get("script_content", "")
            scenes = context.get("scenes", [])

            storyboard = self._generate_storyboard(scenes)

            return AgentResult(
                success=True,
                data={
                    "storyboard": storyboard,
                    "total_shots": len(storyboard["shots"]),
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    def _generate_storyboard(self, scenes: List[Dict]) -> Dict:
        shot_sizes = ["extreme_long", "long", "medium", "close_up", "extreme_close_up"]
        camera_movements = ["push_in", "pull_out", "pan", "tilt", "static"]

        storyboard = {"shots": []}
        shot_number = 1

        for scene in scenes:
            for i in range(3):
                shot = {
                    "shot_id": f"shot_{shot_number:03d}",
                    "shot_number": shot_number,
                    "scene_id": scene.get("scene_id", ""),
                    "location": scene.get("location", ""),
                    "shot_size": shot_sizes[(shot_number - 1) % len(shot_sizes)],
                    "camera_movement": camera_movements[(shot_number - 1) % len(camera_movements)],
                    "duration": 3 + i,
                    "description": f"第{shot_number}镜：{scene.get('description', '')[:30]}",
                    "dialogue": [],
                    "sound_effects": [],
                    "transition": "cut" if i < 2 else "fade",
                }
                storyboard["shots"].append(shot)
                shot_number += 1

        return storyboard

    async def _analyze_shots(self, context: Dict[str, Any]) -> AgentResult:
        try:
            storyboard = context.get("storyboard", {})
            shots = storyboard.get("shots", [])

            analysis = {
                "total_shots": len(shots),
                "shot_size_distribution": {},
                "camera_movement_distribution": {},
                "total_duration": sum(shot.get("duration", 0) for shot in shots),
            }

            for shot in shots:
                size = shot.get("shot_size", "medium")
                movement = shot.get("camera_movement", "static")
                analysis["shot_size_distribution"][size] = analysis["shot_size_distribution"].get(size, 0) + 1
                analysis["camera_movement_distribution"][movement] = analysis["camera_movement_distribution"].get(movement, 0) + 1

            return AgentResult(
                success=True,
                data={
                    "analysis": analysis,
                },
                cost=0.0,
            )
        except Exception as e:
            return AgentResult(
                success=False,
                error=str(e),
            )

    async def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []

        action = data.get("action")
        valid_actions = ["arrange", "analyze_shots"]
        if action not in valid_actions:
            errors.append(f"无效的 action: {action}")

        if action == "arrange":
            if "scenes" not in data:
                errors.append("缺少 scenes")

        if action == "analyze_shots":
            if "storyboard" not in data:
                errors.append("缺少 storyboard")

        if errors:
            return {"valid": False, "errors": errors}
        return {"valid": True}
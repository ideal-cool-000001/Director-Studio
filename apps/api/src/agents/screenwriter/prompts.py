SCREENWRITER_SYSTEM_PROMPT = """你是一位专业的编剧，擅长创作各种类型的剧本和小说。

请根据用户提供的信息，创作高质量的剧本内容。

创作要求：
1. 结构清晰，包含标题、类型、基调、角色列表、剧情梗概和剧本正文
2. 人物性格鲜明，对话自然生动
3. 场景描写细致，画面感强
4. 符合所选类型的风格特点

输出格式要求：
- 使用Markdown格式
- 剧本正文使用标准剧本格式
- 角色名使用大写
- 动作描述使用【】括起来
- 对话前标注角色名"""


SCREENWRITER_STORY_SKELETON_PROMPT = """请为以下创意构思一个完整的故事骨架：

创意：{idea}
类型：{genre}
基调：{tone}
目标字数：{word_limit}字

请输出：
1. 故事大纲（三幕式结构）
2. 主要角色设定（至少3个）
3. 关键情节点

格式要求：
<story_skeleton>
【第一幕】：内容描述
【第二幕】：内容描述
【第三幕】：内容描述
</story_skeleton>

<characters>
- 角色名：性格描述，在故事中的作用
</characters>

<plot_points>
1. 情节点1
2. 情节点2
3. 情节点3
</plot_points>"""


SCREENWRITER_SCRIPT_PROMPT = """请根据以下故事骨架创作完整的剧本：

故事骨架：
{story_skeleton}

角色设定：
{characters}

创作要求：
- 剧本格式规范
- 对话生动自然
- 场景描写有画面感
- 符合{genre}类型特点
- 基调为{tone}

请输出完整的剧本内容。"""


SCREENWRITER_REFINEMENT_PROMPT = """请根据以下要求修改剧本：

原剧本：
{original_script}

修改要求：
{instructions}

请输出修改后的剧本。"""


SCREENWRITER_CHARACTER_PROMPT = """请为以下剧本设计详细的角色形象：

剧本内容：
{script_content}

请为每个主要角色输出：
- 姓名
- 年龄
- 外貌特征（身高、体型、发型、五官、衣着风格）
- 性格特点
- 角色定位（主角/配角/反派）

格式要求：
<character name="角色名">
- 年龄：XX岁
- 外貌：详细描述
- 性格：详细描述
- 定位：主角/配角/反派
</character>"""
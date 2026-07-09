PROMOTION_SYSTEM_PROMPT = """你是一位专业的影视宣发专家，擅长从影视作品中提取亮点并制作宣传内容。

你的核心职责：
1. 分析成品视频，挑选最具吸引力的片段
2. 为不同平台制作适配的短视频
3. 撰写吸引人的文案和标题
4. 批量生成多种版本的宣发内容

平台适配要求：
- 抖音/快手：15-60秒，节奏快，开头吸引人
- B站：1-5分钟，内容完整，有深度
- 小红书：30-90秒，画面精美，文字优美
- 微博：15-30秒，话题性强，易于传播"""


PROMOTION_HIGHLIGHT_EXTRACTION_PROMPT = """请从以下视频内容中提取最具吸引力的亮点：

视频标题：{video_title}
视频时长：{duration}秒
剧情梗概：{synopsis}
关键场景：{key_scenes}

请输出：
1. 3个最佳亮点片段（包含时间点和描述）
2. 每个片段的推荐时长
3. 推荐发布平台

格式要求：
<highlight segment="1">
时间点：XX:XX-XX:XX
描述：片段内容描述
推荐时长：XX秒
推荐平台：抖音/B站/小红书/微博
</highlight>"""


PROMOTION_SCRIPT_GENERATION_PROMPT = """请为以下亮点片段创作宣发文案：

视频标题：{video_title}
亮点描述：{highlight_description}
目标平台：{platform}
目标时长：{duration}秒

请输出：
1. 短视频脚本（镜头描述+文字）
2. 吸引人的标题
3. 文案内容
4. 相关话题标签

格式要求：
<title>吸引人的标题</title>
<copy>文案内容</copy>
<hashtags>#标签1 #标签2 #标签3</hashtags>"""


PROMOTION_BATCH_GENERATION_PROMPT = """请批量生成以下宣发内容：

视频标题：{video_title}
剧情梗概：{synopsis}
关键场景：{key_scenes}

请为以下平台各生成一套宣发方案：
1. 抖音/快手（15-60秒）
2. B站（1-5分钟）
3. 小红书（30-90秒）
4. 微博（15-30秒）

每套方案包含：
- 短视频脚本
- 标题
- 文案
- 话题标签"""
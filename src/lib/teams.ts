export async function sendTeamsNotification({
    requesterName,
    department,
    items,
    requestType,
    incidentDescription
}: {
    requesterName: string;
    department: string;
    items: string; // Pre-formatted string of items
    requestType: 'NORMAL' | 'LOST_BROKEN';
    incidentDescription?: string;
}) {
    const webhookUrl = requestType === 'LOST_BROKEN'
        ? (process.env.TEAMS_WEBHOOK_URL_LOST_BROKEN || process.env.TEAMS_WEBHOOK_URL)
        : process.env.TEAMS_WEBHOOK_URL;

    if (!webhookUrl) return;

    const title = requestType === 'NORMAL'
        ? "🆕 Có yêu cầu cấp phát PPE Mới"
        : "⚠️ Có báo cáo Mất/Hỏng PPE Mới";

    const color = requestType === 'NORMAL' ? "107C10" : "D83B01"; // Green vs Red

    const cardPayload = {
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                contentUrl: null,
                content: {
                    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                    type: "AdaptiveCard",
                    version: "1.2",
                    body: [
                        {
                            type: "TextBlock",
                            text: title,
                            weight: "Bolder",
                            size: "Medium",
                            color: requestType === 'NORMAL' ? "Good" : "Attention"
                        },
                        {
                            type: "FactSet",
                            facts: [
                                { title: "Người Yêu Cầu:", value: requesterName },
                                { title: "Phòng Ban:", value: department },
                                { title: "Loại Yêu Cầu:", value: requestType === 'NORMAL' ? 'Bình Thường' : 'Mất/Hỏng' }
                            ]
                        },
                        {
                            type: "TextBlock",
                            text: "**Vật tư được yêu cầu:**",
                            wrap: true
                        },
                        {
                            type: "TextBlock",
                            text: items,
                            wrap: true
                        }
                    ],
                    actions: [
                        {
                            type: "Action.OpenUrl",
                            title: "Mở Web Phê Duyệt",
                            url: process.env.APP_BASE_URL || "http://localhost:3000"
                        }
                    ]
                }
            }
        ]
    };

    if (requestType === 'LOST_BROKEN' && incidentDescription) {
        cardPayload.attachments[0].content.body.push({
            type: "TextBlock",
            text: `**Mô tả sự cố:** ${incidentDescription}`,
            wrap: true
        } as any);
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardPayload)
        });

        if (!response.ok) {
            console.error('Failed to send Teams notification', await response.text());
        }
    } catch (error) {
        console.error('Error sending Teams notification:', error);
    }
}

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
    const webhookUrls: string[] = [];
    // Normal requests go to the standard Webhook URL
    if (requestType === 'NORMAL' && process.env.TEAMS_WEBHOOK_URL) {
        webhookUrls.push(process.env.TEAMS_WEBHOOK_URL);
    }
    // Lost/Broken requests go to the specific Lost_Broken URL (or fallback to standard if not provided)
    if (requestType === 'LOST_BROKEN') {
        if (process.env.TEAMS_WEBHOOK_URL_LOST_BROKEN) {
            webhookUrls.push(process.env.TEAMS_WEBHOOK_URL_LOST_BROKEN);
        } else if (process.env.TEAMS_WEBHOOK_URL) {
            webhookUrls.push(process.env.TEAMS_WEBHOOK_URL);
        }
    }

    if (webhookUrls.length === 0) {
        console.log("No webhook URLs configured for", requestType);
        return;
    }

    const title = "🔔 **MỌI NGƯỜI CHÚ Ý:** " + (requestType === 'NORMAL'
        ? "🆕 New PPE Request Created"
        : "⚠️ New Lost/Broken PPE Report");

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
                            "facts": [
                                { "title": "Requester:", "value": requesterName },
                                { "title": "Department:", "value": department },
                                { "title": "Request Type:", "value": requestType === 'NORMAL' ? 'Normal' : 'Lost/Broken' }
                            ]
                        },
                        {
                            "type": "TextBlock",
                            "text": "**Requested Items:**",
                            "wrap": true
                        },
                        {
                            "type": "TextBlock",
                            "text": items,
                            "wrap": true
                        }
                    ],
                    "actions": [
                        {
                            "type": "Action.OpenUrl",
                            "title": "Open Approval Dashboard",
                            "url": process.env.APP_BASE_URL || "https://sparse-sunspot-dun.vercel.app/login"
                        }
                    ]
                }
            }
        ]
    };

    if (requestType === 'LOST_BROKEN' && incidentDescription) {
        cardPayload.attachments[0].content.body.push({
            type: "TextBlock",
            text: `**Event Description:** ${incidentDescription}`,
            wrap: true
        } as any);
    }

    try {
        await Promise.all(webhookUrls.map(async (url) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cardPayload)
            });
            if (!response.ok) {
                console.error(`Failed to send Teams notification to ${url}`, await response.text());
            }
        }));
    } catch (error) {
        console.error('Error sending Teams notification:', error);
    }
}

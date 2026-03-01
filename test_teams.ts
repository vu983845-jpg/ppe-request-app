import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sendTeamsNotification } from './src/lib/teams';

async function bootstrap() {
    console.log("Mocking a direct teams payload ping...");
    try {
        await sendTeamsNotification({
            requesterName: 'Action Tester',
            department: 'IT',
            items: '- 2x Gloves',
            requestType: 'NORMAL'
        });
        console.log("Success: sendTeamsNotification execution finished without crash.");
    } catch (e) {
        console.error("Crash: ", e);
    }
}
bootstrap();

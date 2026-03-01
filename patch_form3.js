const fs = require('fs');
const path = 'src/app/request/form.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Zod Schema
content = content.replace(/attachmentUrl: z\.string\(\)\.optional\(\),/, '');

content = content.replace(/if \(!data\.incidentDate\) \{[\s\S]*?path: \['incidentDate'\]\s*\}\);\s*\}/, `if (!data.incidentDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['incidentDate']
            });
        }
        if (!data.lastReceiptDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['lastReceiptDate']
            });
        }`);

// 2. Default Values
content = content.replace(/attachmentUrl: '',/, "lastReceiptDate: '',");

// 3. handleConfirmSubmit file upload block removal
content = content.replace(/        let attachmentUrl = ''\n        const values = confirmedValues\n[\s\S]*?        const payload = \{ \.\.\.values, items: itemsPayload, attachmentUrl \}/,
    `        const values = confirmedValues
        const itemsPayload = values.items.map((item: any) => {
            const ppe = ppes.find(p => p.name === item.itemName && (!item.size || p.size === item.size))
            return {
                ppeId: ppe?.id || '',
                quantity: item.quantity
            }
        })
        const payload = { ...values, items: itemsPayload }`);

// 4. Also remove the file state
content = content.replace(/const \[file, setFile\] = useState<File \| null>\(null\)/, '');

// 5. Inject lastReceiptDate inside the LOST_BROKEN grid
const incidentDateJsx = `                            <FormField
                                control={form.control}
                                name="incidentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-red-800 dark:text-red-200">{t.requestForm.incidentDate || "Date of Incident"} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />`;

const lastReceiptDateJsx = `                            <FormField
                                control={form.control}
                                name="lastReceiptDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-red-800 dark:text-red-200">Ngày nhận PPE gần nhất *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />`;

content = content.replace(incidentDateJsx, incidentDateJsx + '\n' + lastReceiptDateJsx);

// 6. Remove the attachment FormItem block entirely and make note span 2 cols
content = content.replace(/                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n                    <FormField\n                        control=\{form\.control\}\n                        name="note"[\s\S]*?<FormControl>\n                                    <Textarea placeholder=\{t\.requestForm\.reasonPlaceholder\} \{\.\.\.field\} \/>\n                                <\/FormControl>\n                                <FormMessage \/>\n                            <\/FormItem>\n                        \)\}\n                    \/>\n\n                    <FormItem>\n                        <FormLabel>\{t\.requestForm\.attachment\}<\/FormLabel>\n                        <FormControl>\n                            <Input type="file" onChange=\{\(e\) => setFile\(e\.target\.files\?\.\[0\] \|\| null\)\} \/>\n                        <\/FormControl>\n                        <p className="text-xs text-zinc-500">\{t\.requestForm\.attachmentDesc\}<\/p>\n                    <\/FormItem>\n                <\/div>/,
    `                <div className="grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.reason}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t.requestForm.reasonPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>`);

fs.writeFileSync(path, content, 'utf8');
console.log('Form updated successfully.');

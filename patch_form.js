const fs = require('fs');

const path = 'src/app/request/form.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Zod Schema
content = content.replace(
    /items: z\.array\(z\.object\(\{[\s\S]*?ppeId: z\.string[^,]+,[\s\S]*?quantity: z\.number[^}]+\}\)\)\.min\(1, 'You must request at least one item\.'\),/,
    `items: z.array(z.object({
        itemName: z.string().min(1, 'Please select an item'),
        size: z.string().optional(),
        quantity: z.number().positive().min(1, 'At least 1 item is required'),
    })).min(1, 'You must request at least one item.'),`
);

// 2. Default Values
content = content.replace(
    /items: \[\{ ppeId: '', quantity: 1 \}\],/,
    `items: [{ itemName: '', size: '', quantity: 1 }],`
);

// 3. handleInitialSubmit validation
content = content.replace(
    /        \/\/ Switch to confirmation mode\n        setConfirmedValues\(values\)/,
    `        // Validate sizes
        const invalidItemIndex = values.items.findIndex((item: any) => {
            const variants = ppes.filter(p => p.name === item.itemName)
            const needsSize = variants.some(v => v.size)
            return needsSize && !item.size
        })

        if (invalidItemIndex > -1) {
            form.setError(\`items.\${invalidItemIndex}.size\` as any, { message: 'Size is required' })
            return
        }

        // Switch to confirmation mode
        setConfirmedValues(values)`
);

// 4. handleConfirmSubmit
content = content.replace(
    /const payload = \{ \.\.\.values, attachmentUrl \}/,
    `        const itemsPayload = values.items.map((item: any) => {
            const ppe = ppes.find(p => p.name === item.itemName && (!item.size || p.size === item.size))
            return {
                ppeId: ppe?.id,
                quantity: item.quantity
            }
        })
        const payload = { ...values, items: itemsPayload, attachmentUrl }`
);

// 5. Confirmed JSX
content = content.replace(
    /const ppe = ppes\.find\(p => p\.id === item\.ppeId\)/,
    `const ppe = ppes.find(p => p.name === item.itemName && (!item.size || p.size === item.size))`
);

// 6. Form JSX
const formJsxOld = `                                <FormField
                                    control={form.control}
                                    name={\`items.\${index}.ppeId\`}
                                    render={({ field: itemField }) => (
                                        <FormItem>
                                            <FormLabel>{t.requestForm.ppeItem} *</FormLabel>
                                            <Select onValueChange={itemField.onChange} value={itemField.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t.requestForm.selectItem} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(
                                                        ppes.reduce((acc, ppe) => {
                                                            if (!acc[ppe.name]) acc[ppe.name] = []
                                                            acc[ppe.name].push(ppe)
                                                            return acc
                                                        }, {} as Record<string, typeof ppes>)
                                                    ).map(([name, variants]) => {
                                                        if (variants.length === 1 && !variants[0].size) {
                                                            return (
                                                                <SelectItem key={variants[0].id} value={variants[0].id}>
                                                                    {variants[0].name} ({variants[0].unit})
                                                                </SelectItem>
                                                            )
                                                        }
                                                        return (
                                                            <SelectGroup key={name}>
                                                                <SelectLabel>{name}</SelectLabel>
                                                                {variants.map((v) => (
                                                                    <SelectItem key={v.id} value={v.id}>
                                                                        {name} - Size {v.size} ({v.unit})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />`;

const formJsxNew = `                                <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
                                    <FormField
                                        control={form.control}
                                        name={\`items.\${index}.itemName\`}
                                        render={({ field: itemField }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>{t.requestForm.ppeItem} *</FormLabel>
                                                <Select onValueChange={(val) => {
                                                    itemField.onChange(val);
                                                    form.setValue(\`items.\${index}.size\`, '');
                                                }} value={itemField.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t.requestForm.selectItem} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Array.from(new Set(ppes.map(p => p.name))).map((name) => (
                                                            <SelectItem key={name} value={name}>
                                                                {name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {(() => {
                                        const currentName = form.watch(\`items.\${index}.itemName\`);
                                        const variants = ppes.filter(p => p.name === currentName);
                                        const needsSize = variants.some(v => v.size);

                                        if (!needsSize || !currentName) return null;

                                        return (
                                            <FormField
                                                control={form.control}
                                                name={\`items.\${index}.size\`}
                                                render={({ field: sizeField }) => (
                                                    <FormItem className="w-full md:w-[150px]">
                                                        <FormLabel>Size *</FormLabel>
                                                        <Select onValueChange={sizeField.onChange} value={sizeField.value || ''}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Size" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {variants.map((v) => (
                                                                    <SelectItem key={v.id} value={v.size!}>
                                                                        {v.size}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        );
                                    })()}
                                </div>`;

content = content.replace(formJsxOld, formJsxNew);

// 7. Append button
content = content.replace(
    /onClick=\{\(\) => append\(\{ ppeId: '', quantity: 1 \}\)\}/,
    `onClick={() => append({ itemName: '', size: '', quantity: 1 })}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Form updated.');

import React, {forwardRef, useEffect, useState} from 'react';
import {Avatar, Group, Select, Text} from "@mantine/core";
import axios from "axios";

const LanguageSelect = ({language, setLanguage, runtimes}) => {

    const [runtimesList, setRuntimesList] = useState([])
    useEffect(() => {
        setRuntimesList([])

        let rtl = []
        runtimes.forEach((rt) => {
            if(runtimes.filter((l) => l.language === rt.language).length > 1) {
                rtl.push({
                    label: rt.language,
                    value: rt.language + "-" + rt.version,
                    description: rt.version
                })
                return;
            }
            rtl.push({
                label: rt.language,
                value: rt.language,
                description: rt.version
            })
        })

        setRuntimesList(rtl)

    }, [])


    const SelectItem = forwardRef(
        ({ label, description, value, ...others }, ref) => (
            <div ref={ref} {...others}>
                <Group noWrap>

                    <div>
                        <Text>{label}</Text>
                        <Text size="xs" color="dimmed">
                            {description}
                        </Text>
                    </div>
                </Group>
            </div>
        )
    );



    return (
        <div>
            {
                runtimesList.length !== 0 && <Select
                    label="Choose a language"
                    placeholder="Pick one"
                    itemComponent={SelectItem}
                    data={runtimesList}
                    clearable
                    searchable
                    maxDropdownHeight={400}
                    nothingFound="Nothing found."
                    value={language} onChange={setLanguage}
                />
            }

        </div>

    );
}

export default LanguageSelect

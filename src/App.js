import './App.css';
import {
    ActionIcon,
    AppShell,
    Box,
    Button,
    Drawer,
    Input,
    LoadingOverlay,
    Navbar,
    ScrollArea,
    Title,
    Kbd,
    Modal, UnstyledButton, createStyles, Group, ThemeIcon, Text, Select
} from "@mantine/core";
import Logo from "./browser.png";
import LanguageSelect from "./components/LanguageSelect";
import React, {useEffect, useRef, useState} from "react";
import {useNotifications} from "@mantine/notifications";
import {BsFillFileEarmarkPlayFill} from "react-icons/bs";
import MonacoEditor from "react-monaco-editor";
import {VscDebugConsole} from "react-icons/vsc";
import {Prism} from "@mantine/prism";
import axios from "axios";
import {useModals} from "@mantine/modals";
import {useHotkeys} from "@mantine/hooks";
import {FiInfo} from "react-icons/fi";
import {HiOutlineDownload} from "react-icons/hi";

const useStyles = createStyles((theme) => ({
    button: {
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
    },
}));

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function App() {
    const notifications = useNotifications();
    const modals = useModals();

    const [language, setLanguage] = React.useState("javascript-16.3.0");
    const [editorValue, setEditorValue] = React.useState("");
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [server, setServer] = useState("https://emkc.org/api/v2")
    const [consoleOutput, setConsoleOutput] = useState(null);
    const [languageVersion, setLanguageVersion] = useState("16.3.0");
    const [runtimes, setRuntimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const inputFile = useRef(null)


    useHotkeys([
        ['ctrl+R', () => run()],
        ['ctrl+shift+c', () => setConsoleOpen(!consoleOpen)],
        ['ctrl+s', () => downloadFile()]
    ]);

    useEffect(() => {
        axios.get(`${server}/piston/runtimes`)
            .then(({data}) => {
                setRuntimes(data)
            })
    }, []);
    const changeLanguage = (language) => {
        console.log(language)
        let version = "";
        if (language) {
            if(language.includes("-")) {
                version = language.split("-")[1];
                setLanguageVersion(language.split("-")[1])
                setLanguage(language)
                notifications.showNotification({
                    title: "✨ Language changed.",
                    message: "You're now using " + language.split("-")[0] + " with version " + version,
                    color: "green"
                })
            } else {
                version = runtimes.find((lang) => lang.language === language).version
                setLanguageVersion(version)
                setLanguage(language);
                notifications.showNotification({
                    title: "✨ Language changed.",
                    message: "You're now using " + language + " with version " + version,
                    color: "green"
                })
            }

        }
        if (!language) {
            setLanguageVersion("")
        }

    }

    const run = () => {

        if (!language) {
            notifications.showNotification({
                title: "❌ Not runnable.",
                message: "Please select a language.",
                color: "red"
            })
            return;
        }
        setLoading(true);
        axios.post(`${server}/piston/execute`, {
            "language": language.split("-")[0],
            "version": languageVersion,
            "files": [
                {
                    "name": "run.java",
                    "content": editorValue
                }
            ],
            "stdin": "",
            "args": ["1", "2", "3"],
            "compile_timeout": 10000,
            "run_timeout": 3000,
            "compile_memory_limit": -1,
            "run_memory_limit": -1
        })
            .then(({data}) => {
                console.log(data)
                setConsoleOutput(data.run.output)
                setConsoleOpen(true)
                setLoading(false)
            })


    }

    const downloadFile = () => {
        notifications.showNotification({
            title: "🎉 Successful!",
            message: "Your file is being saved.",
            color: "green"
        })
        download(editorValue, "file.txt", "text/plain")

    }

    const onFileChange = (event) => {
        event.stopPropagation();
        event.preventDefault();
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            let match = /^data:(.*);base64,(.*)$/.exec(e.target.result);
            if (match == null) {
                throw 'Could not parse result'; // should not happen
            }
            let content = match[2];
            console.log(content)
            setEditorValue(atob(content))
            notifications.showNotification({
                title: "🎉 Successful!",
                message: "Your file was loaded.",
                color: "green"
            })
        };
        reader.readAsDataURL(file);


    }





    const { classes } = useStyles();



    return (
        <div>
            <LoadingOverlay visible={loading} />
            <Modal
                opened={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="About the project"
                centered
            >
                RunAnything enables you to run any arbitrary code in most common languages directly in your browser. All code is ran in a secure, sandboxed environment using Docker and <a
                href="https://github.com/engineer-man/piston" style={{color: "white"}}>piston</a>.
                <br/>
                <br/>
                <b>Current Version: v{process.env.REACT_APP_VERSION}</b>
                <br/>
                <br/>
                <Title order={4}>Keyboard shortcuts</Title>
                Run: <Kbd>Ctrl</Kbd> + <Kbd>R</Kbd><br/>
                Open console: <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>C</Kbd><br/>
                Save to file: <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
                <br/>
                <br/>
                <a style={{color: "white"}} href="https://www.flaticon.com/free-icons/run" title="run icons">Run icons created by Smashicons - Flaticon</a>
                <br/>
                <a style={{color: "white"}} href="https://legal.streamp.live/imprint">Legal notice</a>
                <br/>
                <a style={{color: "white"}} href="https://legal.streamp.live/privacy">Privacy Policy</a>

            </Modal>
            <AppShell padding={0}
                      navbar={<Navbar height={"100vh"} padding={10} width={{base: 300}}>
                          <Navbar.Section mt="xs" sx={{
                              display: "flex",
                              alignItems: "center",
                              borderBottom: "1px solid rgb(55, 58, 64)",
                              paddingBottom: "20px",
                              paddingRight: "10px",
                              paddingLeft: "10px"
                          }}><img src={Logo} alt="" width={40}/><Title order={4}
                                                                       ml={8}>RunAnything</Title></Navbar.Section>

                          <Navbar.Section
                              grow
                              component={ScrollArea}
                              ml={-10}
                              mr={-10}
                              sx={{paddingLeft: 10, paddingRight: 10}}
                          >
                              {
                                  runtimes.length !== 0 &&
                                  <div>
                                      <Box my={10}>
                                          <LanguageSelect language={language} setLanguage={changeLanguage} runtimes={runtimes}/>

                                      </Box>

                                      <Box my={10}>
                                          <Input
                                              placeholder="Version"
                                              value={languageVersion}
                                              disabled
                                          />
                                      </Box>
                                  </div>
                              }
                              <Select
                                  label="Pick server"
                                  placeholder="Pick a server"
                                  value={server} onChange={setServer}
                                  data={[
                                      { value: 'https://emkc.org/api/v2', label: 'https://emkc.org/api/v2' },
                                  ]}
                              />

                              <Box sx={{marginTop: 10}}>
                                  <UnstyledButton className={classes.button} onClick={() => inputFile.current.click()}>
                                      <Group>
                                          <ThemeIcon color={"red"} variant="light">
                                              <HiOutlineDownload />
                                          </ThemeIcon>

                                          <Text size="sm">Open a file</Text>
                                      </Group>
                                  </UnstyledButton>
                              </Box>
                            <Box sx={{marginTop: 10}}>
                                <UnstyledButton className={classes.button} onClick={() => downloadFile()}>
                                    <Group>
                                        <ThemeIcon color={"green"} variant="light">
                                            <HiOutlineDownload />
                                        </ThemeIcon>

                                        <Text size="sm">Save as file</Text>
                                    </Group>
                                </UnstyledButton>
                            </Box>



                              <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={onFileChange}/>





                          </Navbar.Section>

                          <Navbar.Section>
                              <UnstyledButton className={classes.button} onClick={() => setShowInfoModal(true)}>
                                  <Group>
                                      <ThemeIcon color={"blue"} variant="light">
                                          <FiInfo />
                                      </ThemeIcon>

                                      <Text size="sm">About</Text>
                                  </Group>
                              </UnstyledButton>
                              <Button variant="gradient" gradient={{from: 'teal', to: 'lime', deg: 105}} sx={{marginTop: 10}}
                                      leftIcon={<BsFillFileEarmarkPlayFill/>} fullWidth size={"lg"}
                                      onClick={() => run()}>Run</Button>

                          </Navbar.Section>
                      </Navbar>}
                      styles={(theme) => ({
                          main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
                      })}
            >


                <MonacoEditor
                    width="100%"
                    height="100vh"
                    language={language.split("-")[0]}
                    theme="vs-dark"
                    value={editorValue}
                    onChange={setEditorValue}
                />

                <ActionIcon size="xl" radius="xl" variant="filled" sx={{position: "fixed", bottom: 30, right: 30}}
                            onClick={() => setConsoleOpen(true)}>
                    <VscDebugConsole/>
                </ActionIcon>

                <Drawer
                    opened={consoleOpen}
                    onClose={() => setConsoleOpen(false)}
                    title="Console output"
                    padding="xl"
                    size="xl"
                >
                    {
                        consoleOutput ? <Prism language="css" copyLabel="Copy logs"
                                               copiedLabel="Copied logs to the clipboard">
                            {consoleOutput}
                        </Prism> : <Title order={3}>No logs yet.</Title>
                    }

                </Drawer>

            </AppShell>


        </div>

    );
}

export default App;

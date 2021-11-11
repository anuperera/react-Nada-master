import React from 'react';
import Controls from './components/controls/Controls';
import Visualizer from './components/selector/Visualizer';
import Selector from './components/selector/Selector';
import * as controlData from './components/controls/control.json';
import './App.css';
import {
    Buffer,
    Loop,
    Sampler,
    Transport,
    Freeverb,
    PingPongDelay,
    MembraneSynth,
    Synth,
    Volume
} from 'tone';
import InstrumentObject from './lib/instrument-object';
import { rangeToDb } from './utils/convert-volume-range';
import { Tone } from 'tone/build/esm/core/Tone';

class Download extends React.Component{
    render(){
        return <div className ="Download">
        <button >Button</button>
    </div>
    }
}

class Container extends React.Component {
    constructor(){
        super();
        this.state = {
            i: -1,
            pattern: ["https://drive.google.com/u/0/uc?id=1eEz-Y64eFZn1GMYPMdJPV7Dj4vzXMDGi&export=download", "https://drive.google.com/u/0/uc?id=1hNAh8XEwzWR10448kIe2FMrbdKat8dz0&export=download"]
        }
    }

    increment(){
        const integ = this.state.i + 1;
        this.setState({i: integ})
        console.log(this.state.i)

        // var a = document.createElement("a");
        // a.href = this.state.pattern;
        // a.setAttribute("download", this.state.pattern);
        // a.click();
    }

    render() {
        return <div className="container">
            {this.props.children}
            <a href = {this.state.pattern[this.state.i]} download = {this.state.pattern[this.state.i]} onClick ={this.increment.bind(this)} className = "DownloadBtn">Download</a>
            </div>;
    }
}

export default class App extends React.Component {
    constructor(props) {
        super(props);
        let beatDivisionOptions = [
            { value: 2, label: 2 },
            { value: 3, label: 3 },
            { value: 4, label: 4 },
            { value: 5, label: 5 },
            { value: 6, label: 6 },
            { value: 7, label: 7 },
            { value: 8, label: 8 },
            { value: 9, label: 9 },
            { value: 10, label: 10 },
            { value: 11, label: 11 },
            { value: 12, label: 12 },
            { value: 13, label: 13 },
            { value: 14, label: 14 },
            { value: 15, label: 15 },
            { value: 16, label: 16 },
        ];
        let beatDivision = 16;
        let loopBeat = new Loop(this.song, '16n');

        const transport = Transport;
        let bpm = 140;
        transport.timeSignature = beatDivision / 16;
        transport.bpm.value = bpm;
        let counter = 0;
        let beats = [];
        let instrumentOptions = controlData["instrumentOptions"];
        let allInstrumentData = [];
        for (let i = 0; i < beatDivision; i++) {
            beats.push(i);
        }

        let notes = [
            'C',
            'C#',
            'D',
            'D#',
            'E',
            'F',
            'F#',
            'G',
            'G#',
            'A',
            'A#',
            'B',
        ];
        this.state = {
            volume: new Volume().toDestination(),
            sampleMap: {},
            notes,
            beats,
            instrumentOptions,
            allInstrumentData,
            loopBeat,
            transport,
            beatDivision,
            beatDivisionOptions,
            bpm,
            counter,
            isPlaying: false,
        };
    }

    //start the loop if isPlaying = false else stop loop
    startStopLoop = () => {
        if (this.state.isPlaying === false) {
            this.state.transport.start();
            this.state.loopBeat.start(0);
        } else if (this.state.isPlaying === true) {
            this.state.loopBeat.stop();
        }
        this.setState({ isPlaying: !this.state.isPlaying });
    };

    //this sets up the loop, including the counter, using beat division from STATE
    song = (time) => {
        let { counter, beatDivision } = this.state;
        this.setState({
            counter: (counter + 1) % beatDivision,
        });
        this.playInstruments(time);
    };

    uploadAudioSample = (audioSrc, fallbackName) =>
        this.onAddInstrumentClick('upload', audioSrc, fallbackName);

    //this creates an instrument and defines the three parts of each element in the InstrumentData array-- 
    //each element has the Instrument Object - [0], the beats clicked [1], and the name of the instrument [2], defined by user
    onAddInstrumentClick = (instrument, src = null, fallbackName = null) => {
        let newInstrument;
        let instrumentType;

        let actx = Tone.context;

        let instrumentSettings = {};
        let instrumentName = instrument;
        let reverb = new Freeverb().connect(this.state.volume);
        let delay = new PingPongDelay().connect(reverb);
        reverb.wet.value = 0;
        delay.wet.value = 0;

        if (instrument === 'upload' && src) {
            let newName = prompt("What's the name of your new instrument?");
            if (this.state.instrumentOptions.includes(newName)) {
                newName = prompt(
                    "Whoops, there's already an instrument with this name. Try something else."
                );
            }
            instrumentName = newName.length < 1 ? fallbackName : newName;
            this.setState((prevState) => ({
                instrumentOptions: [
                    instrumentName,
                    ...prevState.instrumentOptions,
                ],
            }));
            const buffer = new Buffer(src);
            newInstrument = new Sampler({
                urls: {
                    C4: buffer,
                },
            });
            this.setState((prevState) => ({
                sampleMap: {
                    ...prevState.sampleMap,
                    [instrumentName]: newInstrument,
                },
            }));
            instrumentType = 'melodic';
            instrumentSettings = {
                note: {
                    noteSelected: this.state.notes[0],
                    octave: 4,
                },
            };
        } else if (instrument === 'Preset 01') {
            newInstrument = new MembraneSynth();
            instrumentType = 'melodic';
            instrumentSettings = {
                note: {
                    noteSelected: this.state.notes[0],
                    octave: 2,
                },
            };
        } else if (instrument === 'Preset 02') {
            newInstrument = new Synth();
            instrumentType = 'melodic';
            instrumentSettings = {
                note: {
                    noteSelected: this.state.notes[0],
                    octave: 3,
                },
            };
        }else {
            newInstrument = this.state.sampleMap[instrument];
            instrumentType = 'melodic';
            instrumentSettings = {
                note: {
                    noteSelected: this.state.notes[0],
                    octave: 4,
                },
            };
        }

        instrumentSettings.effects = {
            reverb: reverb,
            delay: delay,
        };

        const newInstrumentObject = new InstrumentObject(
            newInstrument,
            [],
            instrumentType,
            instrumentName,
            instrumentSettings,
            delay
        );

        this.setState({
            allInstrumentData: [
                ...this.state.allInstrumentData,
                newInstrumentObject,
            ],
        });
    };

    //remove the instruments
    removeInstrument = (selectorIndex) => {
        const allInstrumentData = this.state.allInstrumentData;
        const instrumentObject = allInstrumentData[selectorIndex];
        const effects = instrumentObject.instrumentSettings.effects;
        Object.keys(effects).forEach((effectName) => {
            effects[effectName].dispose();
        });

        const name = allInstrumentData[selectorIndex].instrumentName;
        if (!this.state.sampleMap[name]) {
            instrumentObject.instrument.dispose();
        }

        allInstrumentData.splice(selectorIndex, 1);

        this.setState({
            allInstrumentData,
        });
    };

    //this plays the instrument or preset and is called every beat
    playInstruments = (time) => {
        let { allInstrumentData, counter } = this.state;

        

        allInstrumentData.forEach((instrumentObject) => {
            let {
                instrument,
                instrumentType,
                beatsClicked,
                instrumentSettings,
            } = instrumentObject;
            beatsClicked.forEach((beat) => {
                if (counter === beat) {
                    if (instrumentType === 'perc') {
                        instrument.triggerAttackRelease('4n', time, 1);
                    } else if (instrumentType === 'melodic') {
                        instrument.triggerAttackRelease(
                            instrumentSettings.note.noteSelected +
                                instrumentSettings.note.octave,
                            '8n',
                            time,
                            1
                        );
                    } else {
                        let error = 'the instrument type is undefined';
                        throw error;
                    }
                }
            });
        });
    };
    //this function is called whenever a selector is clicked
    //it finds out which selector is clicked and links that to an instrumentObject
    //we then set the state of allInstrumentData[selectorIndex].beatsClicked to an array of numbers

    setBeatsClicked = (selectorIndex, beatClicked) => {
        const allInstrumentData = this.state.allInstrumentData.map(
            (instrumentObject, instrumentIndex) => {
                if (instrumentIndex !== selectorIndex) return instrumentObject;

                const {
                    beatsClicked,
                    instrument,
                    instrumentType,
                    instrumentName,
                    instrumentSettings,
                    volumeNode,
                } = instrumentObject;
                if (beatsClicked.includes(beatClicked) === true) {
                    return {
                        instrument,
                        beatsClicked: beatsClicked.filter(
                            (number) => number !== beatClicked
                        ),
                        instrumentType,
                        instrumentName,
                        instrumentSettings,
                        volumeNode,
                    };
                } else {
                    return {
                        instrument,
                        beatsClicked: [...beatsClicked, beatClicked],
                        instrumentType,
                        instrumentName,
                        instrumentSettings,
                        volumeNode,
                    };
                }
            }
        );
        this.setState({
            allInstrumentData,
        });
    };

    changeBeatDivision = (selectedOption) => {
        const allInstrumentData = this.state.allInstrumentData.map(
            (instrumentObject) => {
                return {
                    ...instrumentObject,
                    beatsClicked: [],
                };
            }
        );

        if (this.state.isPlaying === true) {
            this.startStopLoop();
        }

        let transport = this.state.transport;
        transport.timeSignature = selectedOption / 16;

        let newBeats = [];
        for (let i = 0; i < selectedOption; i++) {
            newBeats.push(i);
        }
        this.setState({
            beatDivision: selectedOption,
            beats: newBeats,
            allInstrumentData,
            transport,
            counter: 0,
        });
    };

    changeTempo = (bpm) => {
        let transport = this.state.transport;
        transport.bpm.value = bpm;
        this.setState({
            transport: transport,
        });
    };

    changeVolume = (value) => {
        let volume = this.state.volume;
        volume.volume.value = value;
        this.setState({ volume });
    };

    updateInstrumentSettings = (setting, update, selectorIndex) => {
        const allInstrumentData = this.state.allInstrumentData.map(
            (instrumentObject, instrumentIndex) => {
                if (instrumentIndex !== selectorIndex) return instrumentObject;

                const {
                    beatsClicked,
                    instrument,
                    instrumentType,
                    instrumentName,
                    instrumentSettings,
                    volumeNode,
                } = instrumentObject;
                if (setting === 'note') {
                    instrumentSettings.note.noteSelected = update;
                    return {
                        instrument,
                        beatsClicked,
                        instrumentType,
                        instrumentName,
                        instrumentSettings,
                        volumeNode,
                    };
                }
                if (setting === 'reverb') {
                    let newWet = update / 100;
                    instrumentSettings.effects.reverb.wet.value = newWet;
                    return {
                        instrument,
                        beatsClicked,
                        instrumentType,
                        instrumentName,
                        instrumentSettings,
                        volumeNode,
                    };
                }
                if (setting === 'delay') {
                    let newWet = update / 100;
                    instrumentSettings.effects.delay.wet.value = newWet;
                    return {
                        instrument,
                        beatsClicked,
                        instrumentType,
                        instrumentName,
                        instrumentSettings,
                        volumeNode,
                    };
                }
                if (setting === 'volume') {
                    let newVolume = rangeToDb(update);
                    volumeNode.volume.value = newVolume;

                    return {
                        instrument,
                        beatsClicked,
                        instrumentType,
                        instrumentName,
                        instrumentSettings,
                        volumeNode,
                    };
                } else return this.state.allInstrumentData;
            }
        );

        this.setState({
            allInstrumentData,
        });
    };


    render() {
        const {
            beatDivisionOptions,
            bpm,
            allInstrumentData,
            beats,
            counter,
            instrumentOptions,
            isPlaying,
        } = this.state;

        return (
            <Container>
                <Controls
                    instrumentOptions={instrumentOptions}
                    onStartLoopClick={this.startLoop}
                    onStartStopLoopClick={this.startStopLoop}
                    isPlaying={isPlaying}
                    onRevealDataClick={this.revealData}
                    onStopLoopClick={this.stopLoop}
                    onAddInstrumentClick={this.onAddInstrumentClick}
                    beatDivisionOptions={beatDivisionOptions}
                    onChangeBeatDivision={this.changeBeatDivision}
                    onChangeTempo={this.changeTempo}
                    onChangeVolume={this.changeVolume}
                    bpm={bpm}
                    uploadAudioSample={this.uploadAudioSample}
                />
                <Visualizer counter={counter} beats={beats} />
                {allInstrumentData.map((instrument, i) => {
                    return (
                        <React.Fragment key={i}>
                            <Selector
                                selectorIndex={i}
                                sendBeatsClicked={this.setBeatsClicked}
                                updateInstrumentSettings={
                                    this.updateInstrumentSettings
                                }
                                beats={beats}
                                onRemoveInstrumentClick={this.removeInstrument}
                                instrumentName={instrument.instrumentName}
                                beatsClicked={instrument.beatsClicked}
                                volumeValue={instrument.volumeNode.volume.value}
                                instrumentType={instrument.instrumentType}
                                notes={this.state.notes}
                                noteSelected={
                                    instrument.instrumentType === 'melodic'
                                        ? instrument.instrumentSettings.note
                                              .noteSelected
                                        : null
                                }
                            />
                        </React.Fragment>
                    );
                })}
            </Container>
        );
    }
}

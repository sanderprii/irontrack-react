// src/pages/TrainingsPage.js

import React, { useState, useEffect } from 'react';

// Material-UI
import {
    Container,
    Typography,
    Select,
    MenuItem,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Box,
    Alert,
    List,
    ListItemButton,
    CircularProgress
} from '@mui/material';

// FullCalendar React
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

export default function TrainingsPage() {
    // --- State for creating new training ---
    const [trainingType, setTrainingType] = useState('');
    const [trainingDate, setTrainingDate] = useState('');
    const [showOptions, setShowOptions] = useState(false);

    // WOD-specific
    const [wodSearch, setWodSearch] = useState('');
    const [wodSearchResults, setWodSearchResults] = useState([]);
    const [wodName, setWodName] = useState('');
    const [wodType, setWodType] = useState('');
    const [wodDescription, setWodDescription] = useState('');
    const [wodScore, setWodScore] = useState('');

    // Weightlifting, Cardio, Other => exercises in one multiline
    const [exercises, setExercises] = useState('');

    // --- Loaded trainings for FullCalendar ---
    const [trainings, setTrainings] = useState([]);
    const [loadingTrainings, setLoadingTrainings] = useState(true);
    const [error, setError] = useState('');

    // --- Modal (Dialog) for viewing/editing a single training ---
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTraining, setModalTraining] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL
    // --- 1) Load trainings on mount ---
    useEffect(() => {
        loadTrainings();
    }, []);

    async function loadTrainings() {
        try {
            setLoadingTrainings(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/trainings`, {
                    method: 'GET',

                    headers: {'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }

                });
            if (!response.ok) {
                throw new Error('Failed to load trainings');
            }
            const data = await response.json();
            setTrainings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingTrainings(false);
        }
    }

    // --- 2) Training type selection ---
    function handleTrainingTypeChange(e) {
        const val = e.target.value;
        setTrainingType(val);
        setShowOptions(!!val);
        if (!val) {
            setTrainingDate('');
        }
    }

    // --- 3) WOD search logic ---
    useEffect(() => {
        if (!wodSearch.trim()) {
            setWodSearchResults([]);
            return;
        }
        const fetchWods = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/wods/search-default-wods?q=${encodeURIComponent(wodSearch.toUpperCase())}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    });
                if (response.ok) {
                    const results = await response.json();
                    setWodSearchResults(results.slice(0, 10)); // show top 10
                }
            } catch (error) {
                console.error('Error fetching WODs:', error);
            }
        };
        fetchWods();
    }, [wodSearch]);

    function handleSelectWod(wod) {
        setWodName(wod.name);
        setWodType(wod.type || '');
        // transform description for multiline
        const replaced = wod.description
            .replace(/:/g, ':\n')
            .replace(/,/g, '\n');
        setWodDescription(replaced);
        setWodSearchResults([]);
    }

    // --- 4) Submit new training ---
    async function handleSubmitTraining(e) {
        e.preventDefault();
        if (!trainingType || !trainingDate) {
            alert('Please select training type and date!');
            return;
        }

        let payload = {
            type: trainingType,
            date: trainingDate,
        };

        if (trainingType === 'WOD') {
            payload = {
                ...payload,
                wodName,
                wodType,
                exercises: wodDescription,
                score: wodScore,
            };
        } else {
            payload = {
                ...payload,
                exercises,
            };
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/training`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) {
                alert(result.error || 'Error creating training');
                return;
            }
            // If server returns updated training list, set it:
            setTrainings(result.trainings || []);
            // or re-fetch everything:
            // loadTrainings();

            // Clear form
            setTrainingType('');
            setTrainingDate('');
            setWodName('');
            setWodType('');
            setWodDescription('');
            setWodScore('');
            setExercises('');
            setShowOptions(false);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // --- 5) FullCalendar event logic ---
    // Convert trainings -> FullCalendar events
    function getCalendarEvents() {
        return trainings.map((t) => {
            let bgColor = 'blue';
            if (t.type === 'Weightlifting') bgColor = 'green';
            else if (t.type === 'Cardio') bgColor = 'yellow';
            else if (t.type === 'Other') bgColor = 'orange';

            return {
                id: t.id,
                title: '',  // we only show color
                start: t.date,
                backgroundColor: bgColor,
                borderColor: bgColor,
                extendedProps: { training: t },
            };
        });
    }

    // On eventClick -> open modal
    function handleEventClick(clickInfo) {
        const training = clickInfo.event.extendedProps.training;
        openTrainingModal(training);
    }

    // eventContent, to replicate the "colored bar"
    function renderEventContent(arg) {
        const color = arg.event.backgroundColor || 'blue';
        // Return a small color bar
        return {
            html: `<div style="width:100%;height:10px;background-color:${color};margin-bottom:2px;"></div>`,
        };
    }

    // --- 6) Modal open/close ---
    function openTrainingModal(training) {
        setModalTraining(training);
        setIsEditing(false);
        setModalOpen(true);
    }
    function closeModal() {
        setModalOpen(false);
        setModalTraining(null);
    }

    // --- 7) Edit / Save in modal ---
    function handleEdit() {
        setIsEditing(true);
    }
    async function handleSave() {
        if (!modalTraining) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/training/${modalTraining.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json' },
                body: JSON.stringify(modalTraining),
            });
            if (!response.ok) {
                const resErr = await response.json();
                alert('Error: ' + (resErr.error || 'Unknown'));
                return;
            }
            alert('Training updated!');
            closeModal();
            loadTrainings();
        } catch (err) {
            alert('Error saving training: ' + err.message);
        }
    }

    // Add to records if WOD
    async function handleAddToRecords() {
        if (!modalTraining) return;
        if (modalTraining.type !== 'WOD' || !modalTraining.wodName) return;

        const recordData = {
            type: 'WOD',
            name: modalTraining.wodName,
            date: modalTraining.date,
            score: modalTraining.score,
        };
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/records`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json' },
                body: JSON.stringify(recordData),
            });
            if (!response.ok) {
                const resErr = await response.json();
                alert('Error: ' + (resErr.error || 'Could not add to records'));
                return;
            }
            alert('Added to records successfully!');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    // Update modal training field
    function updateModalField(field, value) {
        setModalTraining((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    // For updating exercises in modal (assuming array)
    function updateExercise(index, newValue) {
        setModalTraining((prev) => {
            const newExercises = [...(prev.exercises || [])];
            newExercises[index] = { exerciseData: newValue };
            return { ...prev, exercises: newExercises };
        });
    }

    return (
        <Container maxWidth={false} sx={{ mt: 3 }}>
            <Typography variant="h4" gutterBottom>
                Training Page
            </Typography>

            {/* --- FORM for creating new training --- */}
            <Box component="form" onSubmit={handleSubmitTraining} sx={{ mb: 4 }}>
                <FormControl fullWidth sx={{ mb: 2, backgroundColor: "background.paper" }}>
                    <InputLabel id="training-type-label">Training Type</InputLabel>
                    <Select
                        labelId="training-type-label"
                        value={trainingType}
                        label="Training Type"
                        onChange={handleTrainingTypeChange}
                        sx={{ backgroundColor: "background.paper" }}

                    >
                        <MenuItem value="">-- Select Training Type --</MenuItem>
                        <MenuItem value="WOD">WOD</MenuItem>
                        <MenuItem value="Weightlifting">Weightlifting</MenuItem>
                        <MenuItem value="Cardio">Cardio</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>

                {showOptions && (
                    <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        value={trainingDate}
                        onChange={(e) => setTrainingDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                        required
                    />
                )}

                {/* WOD stuff */}
                {trainingType === 'WOD' && showOptions && (
                    <Box sx={{ mb: 2 }}>
                        {/* Search default WODs */}
                        <TextField
                            fullWidth
                            label="Search Default WODs"
                            value={wodSearch}
                            onChange={(e) => setWodSearch(e.target.value)}
                            sx={{ mb: 1 }}
                        />
                        {wodSearchResults.length > 0 && (
                            <List dense sx={{ border: '1px solid #ccc', maxHeight: 150, overflowY: 'auto' }}>
                                {wodSearchResults.map((w) => (
                                    <ListItemButton key={w.name} onClick={() => handleSelectWod(w)}>
                                        {w.name}
                                    </ListItemButton>
                                ))}
                            </List>
                        )}

                        <TextField
                            fullWidth
                            label="WOD Name"
                            value={wodName}
                            onChange={(e) => setWodName(e.target.value)}
                            sx={{ mb: 1 }}
                        />

                        <Box sx={{ mb: 1 }}>
                            <Typography>WOD Type:</Typography>
                            <div>
                                {['For Time', 'EMOM', 'Tabata', 'AMRAP'].map((val) => (
                                    <label key={val} style={{ marginRight: 10 }}>
                                        <input
                                            type="radio"
                                            name="wod-type"
                                            value={val}
                                            checked={wodType === val}
                                            onChange={(e) => setWodType(e.target.value)}
                                        />
                                        {val}
                                    </label>
                                ))}
                            </div>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="WOD Description"
                            value={wodDescription}
                            onChange={(e) => setWodDescription(e.target.value)}
                            sx={{ mb: 1 }}
                        />

                        <TextField
                            label="Score"
                            value={wodScore}
                            onChange={(e) => setWodScore(e.target.value)}
                        />
                    </Box>
                )}

                {/* Weightlifting, Cardio, Other */}
                {['Weightlifting', 'Cardio', 'Other'].includes(trainingType) && showOptions && (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Exercises"
                            value={exercises}
                            onChange={(e) => setExercises(e.target.value)}
                        />
                    </Box>
                )}

                {showOptions && (
                    <Button type="submit" variant="contained">
                        Save Training
                    </Button>
                )}
            </Box>

            {/* Error or loading indicator */}
            {loadingTrainings && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            {/* FULLCALENDAR to display trainings */}
            <Box sx={{ mb: 4 }}>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={getCalendarEvents()}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                />
            </Box>

            {/* MODAL (Dialog) for training details */}
            <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
                <DialogTitle>Training Details</DialogTitle>
                <DialogContent>
                    {modalTraining && (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                {modalTraining.type}
                            </Typography>
                            {/* Date */}
                            <TextField
                                label="Date"
                                type="date"
                                value={modalTraining.date?.split('T')[0] || ''}
                                fullWidth
                                onChange={(e) => updateModalField('date', e.target.value)}
                                disabled={!isEditing}
                                sx={{ mb: 2 }}
                                InputLabelProps={{ shrink: true }}
                            />
                            {/* If WOD */}
                            {modalTraining.type === 'WOD' && (
                                <>
                                    <TextField
                                        label="WOD Name"
                                        value={modalTraining.wodName || ''}
                                        fullWidth
                                        disabled={!isEditing}
                                        onChange={(e) => updateModalField('wodName', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="WOD Type"
                                        value={modalTraining.wodType || ''}
                                        fullWidth
                                        disabled={!isEditing}
                                        onChange={(e) => updateModalField('wodType', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="Score"
                                        value={modalTraining.score || ''}
                                        fullWidth
                                        disabled={!isEditing}
                                        onChange={(e) => updateModalField('score', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                </>
                            )}

                            {/* Exercises array => modalTraining.exercises: [{exerciseData: "..."}] */}
                            {/* If it's a WOD or weightlifting, etc., the server response might differ. */}
                            {modalTraining.exercises?.length > 0 && (
                                <Box>
                                    <Typography>Exercises:</Typography>
                                    {modalTraining.exercises.map((ex, idx) => (
                                        <TextField
                                            key={idx}
                                            multiline
                                            minRows={2}
                                            fullWidth
                                            disabled={!isEditing}
                                            value={ex.exerciseData || ''}
                                            onChange={(e) => updateExercise(idx, e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {modalTraining?.type === 'WOD' && modalTraining?.wodName && !isEditing && (
                        <Button onClick={handleAddToRecords} color="secondary">
                            Add to Records
                        </Button>
                    )}
                    {!isEditing && (
                        <Button variant="contained" onClick={handleEdit}>
                            Edit
                        </Button>
                    )}
                    {isEditing && (
                        <Button variant="contained" color="success" onClick={handleSave}>
                            Save
                        </Button>
                    )}
                    <Button onClick={closeModal}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

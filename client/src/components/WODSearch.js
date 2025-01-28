import React, { useState, useEffect } from 'react';
import { searchDefaultWODs } from '../api/wodApi';
import { TextField, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const WODSearch = ({ onSelectWOD, token }) => {
    const [query, setQuery] = useState('');
    const [wodResults, setWodResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim()) {
            setLoading(true);
            searchDefaultWODs(query, token).then((data) => {
                setWodResults(data);
                setLoading(false);
            });
        } else {
            setWodResults([]);
        }
    }, [query, token]);

    return (
        <div>
            <TextField
                label="Search WODs"
                variant="outlined"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {loading ? <CircularProgress /> : (
                <List>
                    {wodResults.map((wod) => (
                        <ListItem key={wod.id} button onClick={() => onSelectWOD(wod)}>
                            <ListItemText primary={wod.name} />
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

export default WODSearch;

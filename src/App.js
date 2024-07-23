import React, { useState, useEffect } from 'react';
import { Container, InputGroup, FormControl, Row, Card, Button, Alert } from 'react-bootstrap';
import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';


const CLIENT_ID = "eb2882904717400b8c951b7d4f460f34";
const CLIENT_SECRET = "43c60a89e5524fb89e96a3acbff5502a";


const App = () => {
    function App() {
        const [searchInput, setSearchInput] = useState("");
        const [accessToken, setAccessToken] = useState("");
        const [playlists, setPlaylists] = useState([]);
        const [songs, setSongs] = useState([]);
        const [albums, setAlbums] = useState([]);
        const [placeholder, setPlaceholder] = useState("Please Enter Artist Name");
        const [para, setPara] = useState("albums");
        const [paraImg, setParaImg] = useState("images[0].url");
        const [errorMessage, setErrorMessage] = useState("");
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
    
        useEffect(() => {
            fetchAccessToken();
        }, []);
    
        const fetchAccessToken = () => {
            var authParameters = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
            }
    
            fetch('https://accounts.spotify.com/api/token', authParameters)
                .then(result => result.json())
                .then(data => {
                    if ('access_token' in data) {
                        setAccessToken(data.access_token);
                        setErrorMessage("");
                    } else {
                        throw new Error('Access token not found in response');
                    }
                })
                .catch(error => setErrorMessage('Failed to fetch access token: ' + error.message));
        };
    
        const searchParameters = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        };
    
        const searchPlaylists = (page = 1) => {
            fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=playlist&limit=20&offset=${(page - 1) * 20}`, searchParameters)
                .then(response => response.json())
                .then(data => {
                    if (data.playlists && data.playlists.items.length > 0) {
                        setPlaylists(data.playlists.items);
                        setTotalPages(Math.ceil(data.playlists.total / 20));
                        setErrorMessage("");
                    } else {
                        throw new Error("No playlists found.");
                    }
                })
                .catch(error => setErrorMessage('Failed to fetch playlists: ' + error.message));
        };
    
        const searchSongs = (page = 1) => {
            fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=20&offset=${(page - 1) * 20}`, searchParameters)
                .then(response => response.json())
                .then(data => {
                    if (data.tracks && data.tracks.items.length > 0) {
                        setSongs(data.tracks.items);
                        setTotalPages(Math.ceil(data.tracks.total / 20));
                        setErrorMessage("");
                    } else {
                        throw new Error("No songs found.");
                    }
                })
                .catch(error => setErrorMessage('Failed to fetch songs: ' + error.message));
        };
    
        const searchAlbums = (page = 1) => {
            fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=artist`, searchParameters)
                .then(response => response.json())
                .then(data => {
                    if (data.artists && data.artists.items.length > 0) {
                        const artistID = data.artists.items[0].id;
                        return fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=20&offset=${(page - 1) * 20}`, searchParameters);
                    } else {
                        throw new Error("Artist not found");
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.items.length > 0) {
                        setAlbums(data.items);
                        setTotalPages(Math.ceil(data.total / 20));
                        setErrorMessage("");
                    } else {
                        throw new Error("No albums found for this artist.");
                    }
                })
                .catch(error => setErrorMessage(error.message || 'Failed to fetch albums'));
        };
    
        const changeVar = (event) => {
            const value = event.target.value;
            if (value == 1) {
                setPlaceholder("Please Enter Artist Name");
                setPara("albums");
                setParaImg("images[0].url");
            } else if (value == 2) {
                setPlaceholder("Please Enter Song Title");
                setPara("songs");
                setParaImg("album.images[0].url");
            } else if (value == 3) {
                setPlaceholder("Please Enter Playlist Name");
                setPara("playlists");
                setParaImg("images[0].url");
            }
        };
    
        const handleSearch = () => {
            if (searchInput.trim() === "") {
                setErrorMessage("Search input cannot be empty");
                return;
            }
    
            setCurrentPage(1);
    
            const value = document.getElementById("select").value;
            if (value == 1) {
                searchAlbums();
            } else if (value == 2) {
                searchSongs();
            } else if (value == 3) {
                searchPlaylists();
            }
        };
    
        const fetchNextPage = () => {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
    
            const value = document.getElementById("select").value;
            if (value == 1) {
                searchAlbums(nextPage);
            } else if (value == 2) {
                searchSongs(nextPage);
            } else if (value == 3) {
                searchPlaylists(nextPage);
            }
        };
    
        const fetchPreviousPage = () => {
            const previousPage = currentPage - 1;
            setCurrentPage(previousPage);
    
            const value = document.getElementById("select").value;
            if (value == 1) {
                searchAlbums(previousPage);
            } else if (value == 2) {
                searchSongs(previousPage);
            } else if (value == 3) {
                searchPlaylists(previousPage);
            }
        };
    
        const handleAssign = async () => {
            try {
                const response = await fetch('http://localhost:5000/assign', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: 'success' })
                });
        
                if (response.ok) {
                    console.log('Assignment successful');
                } else {
                    console.log('Assignment failed');
                }
            } catch (error) {
                console.log('Error:', error);
            }
        };


        const renderCards = () => {
            let items = [];
            if (para === "albums") {
                items = albums;
            } else if (para === "songs") {
                items = songs;
            } else if (para === "playlists") {
                items = playlists;
            }
        
            if (items.length === 0) {
                return null;
            }
        
            return items.map((item, i) => {
                let imgSrc;
                if (para === "albums" || para === "playlists") {
                    imgSrc = item.images[0]?.url;
                } else if (para === "songs") {
                    imgSrc = item.album.images[0]?.url;
                }
                return (
                    <Card key={i} className="result-card">
                        <Card.Img variant="top" src={imgSrc} />
                        <Card.Body>
                            <Card.Title>{item.name}</Card.Title>
                            <Button variant="primary" onClick={() => handleAssign(item)}>Assign</Button>
                        </Card.Body>
                    </Card>
                );
            });
        };
    
        return (
            <div className="App">
                <Container className="mt-5">
                    <InputGroup className="mb-3" size="lg">
                        <select id="select" className="form-select me-2 short-select" onChange={changeVar}>
                            <option value="1">Albums By Artist</option>
                            <option value="2">Songs By Title</option>
                            <option value="3">Playlists By Name</option>
                        </select>
                        <FormControl
                            type="input"
                            placeholder={placeholder}
                            className="search-bar"
                            onKeyDown={event => {
                                if (event.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            onChange={event => setSearchInput(event.target.value)}
                        />
                        <Button variant="primary" onClick={handleSearch}>Search</Button>
                    </InputGroup>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                </Container>
                <Container className="mt-4">
                    <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {renderCards()}
                    </Row>
                </Container>
                <div className="pagination-buttons mt-3">
                    <Button variant="secondary" className="me-2" onClick={fetchPreviousPage} disabled={currentPage === 1}>
                        Previous Page
                    </Button>
                    <Button variant="secondary" onClick={fetchNextPage} disabled={currentPage >= totalPages}>
                        Next Page
                    </Button>
                </div>
            </div>
        );
    }


    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/app" element={<App />} />
            </Routes>
        </Router>
    );
};


export default App;
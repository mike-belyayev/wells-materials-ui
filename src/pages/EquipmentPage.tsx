// src/pages/EquipmentPage.tsx
import { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Button,
    MenuItem, Select, TextField, Popover, FormControl, Divider
} from '@mui/material';
import { Settings, Add, Search, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import WellColumn from '../components/EquipmentPage/WellColumn';
import CreateWellModal from '../components/EquipmentPage/CreateWellModal';
import AddPhaseModal from '../components/EquipmentPage/AddPhaseModal';
import AddSubPhaseModal from '../components/EquipmentPage/AddSubPhaseModal';
import AddItemModal from '../components/EquipmentPage/AddItemModal';
import EditPhaseModal from '../components/EquipmentPage/EditPhaseModal';
import EditSubPhaseModal from '../components/EquipmentPage/EditSubPhaseModal';
import EditItemModal from '../components/EquipmentPage/EditItemModal';
import EditWellModal from '../components/EquipmentPage/EditWellModal';
import { API_ENDPOINTS } from '../config/api';
import type { Well, Item, SiteWithWells, SiteWithPopulatedWells } from '../types';
import './EquipmentPage.css';

const EquipmentPage = () => {
    const { logout, user } = useAuth();
    const isAdmin = user?.isAdmin || false;
    const navigate = useNavigate();

    // Get user's home location - this becomes the wellOwner/rig
    const userRig = user?.homeLocation || 'NSC';

    // State
    const [allWells, setAllWells] = useState<Well[]>([]);
    const [currentSite, setCurrentSite] = useState<SiteWithPopulatedWells | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Wells filtered by current user's rig (wellOwner)
    const [userWells, setUserWells] = useState<Well[]>([]);

    // Active/Next well states - from site data
    const [activeWell, setActiveWell] = useState<Well | null>(null);
    const [nextWell, setNextWell] = useState<Well | null>(null);

    // Column count states
    const [activeWellColumns, setActiveWellColumns] = useState(2);
    const [nextWellColumns, setNextWellColumns] = useState(2);

    // Modal states
    const [createWellModalOpen, setCreateWellModalOpen] = useState(false);
    const [addPhaseModalOpen, setAddPhaseModalOpen] = useState(false);
    const [addSubPhaseModalOpen, setAddSubPhaseModalOpen] = useState(false);
    const [addItemModalOpen, setAddItemModalOpen] = useState(false);
    const [editPhaseModalOpen, setEditPhaseModalOpen] = useState(false);
    const [editSubPhaseModalOpen, setEditSubPhaseModalOpen] = useState(false);
    const [editItemModalOpen, setEditItemModalOpen] = useState(false);
    const [editWellModalOpen, setEditWellModalOpen] = useState(false);

    const [selectedWellForPhase, setSelectedWellForPhase] = useState<Well | null>(null);
    const [selectedPhaseForSubPhase, setSelectedPhaseForSubPhase] = useState<{ well: Well, phaseIndex: number } | null>(null);
    const [selectedPhaseForItem, setSelectedPhaseForItem] = useState<{ well: Well, phaseIndex: number, subPhaseIndex: number } | null>(null);
    const [editingPhase, setEditingPhase] = useState<{ well: Well, phaseIndex: number, phaseName: string } | null>(null);
    const [editingSubPhase, setEditingSubPhase] = useState<{ well: Well, phaseIndex: number, subPhaseIndex: number, subPhaseName: string } | null>(null);
    const [editingItem, setEditingItem] = useState<{ well: Well, phaseIndex: number, subPhaseIndex: number, itemIndex: number, item: Item } | null>(null);
    const [editingWell, setEditingWell] = useState<Well | null>(null);

    // Search/Filter states
    const [wellSearchAnchor, setWellSearchAnchor] = useState<null | HTMLElement>(null);
    const [wellSearchType, setWellSearchType] = useState<'active' | 'next' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch wells and site data on mount
    useEffect(() => {
        fetchAllWells();
        fetchSiteData();
    }, []);

    // Filter wells when userRig changes or wells are loaded
    useEffect(() => {
        if (allWells.length > 0 && userRig) {
            // Filter wells where wellOwner matches user's home location
            const filtered = allWells.filter(well =>
                well.wellOwner.toLowerCase() === userRig.toLowerCase()
            );
            setUserWells(filtered);
        }
    }, [allWells, userRig]);

    const fetchAllWells = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.WELLS, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch wells');
            const data = await response.json();
            setAllWells(data);
        } catch (err) {
            console.error('Failed to fetch wells:', err);
        }
    };

    const fetchSiteData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_ENDPOINTS.SITES}/${userRig}/with-wells`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (response.ok) {
                const data: SiteWithPopulatedWells = await response.json();
                console.log('Fetched site data:', data);
                setCurrentSite(data);

                // Set active and next wells directly from the populated data
                if (data.activeWell) {
                    setActiveWell(data.activeWell);
                }
                if (data.nextWell) {
                    setNextWell(data.nextWell);
                }
            } else if (response.status === 404) {
                await initializeSite();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch site data');
        } finally {
            setLoading(false);
        }
    };

    const initializeSite = async () => {
        try {
            // First try to initialize all sites
            await fetch(API_ENDPOINTS.INITIALIZE_SITES, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            // Then fetch the specific site
            const response = await fetch(API_ENDPOINTS.SITE_WITH_WELLS(userRig), {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentSite(data);
            }
        } catch (err) {
            console.error('Failed to initialize site:', err);
        }
    };

    const handleAssignWell = async (well: Well, type: 'active' | 'next') => {
        try {
            const endpoint = type === 'active'
                ? API_ENDPOINTS.SITE_ACTIVE_WELL(userRig)
                : API_ENDPOINTS.SITE_NEXT_WELL(userRig);

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ wellId: well._id })
            });

            if (!response.ok) {
                throw new Error(`Failed to assign ${type} well`);
            }

            const updatedSite = await response.json();
            setCurrentSite(updatedSite);

            if (type === 'active') {
                setActiveWell(well);
            } else {
                setNextWell(well);
            }

            setWellSearchAnchor(null);

        } catch (err) {
            console.error(`Failed to assign ${type} well:`, err);
            setError(`Failed to assign ${type} well. Please try again.`);
        }
    };

    const handleCreateWell = async (wellData: Partial<Well>) => {
        try {
            const response = await fetch(API_ENDPOINTS.WELLS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    ...wellData,
                    wellOwner: userRig
                })
            });

            if (response.ok) {
                const newWell = await response.json();
                setAllWells(prev => [...prev, newWell]);
                setCreateWellModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to create well:', err);
        }
    };

    const handleAddPhase = async (wellId: string, phaseName: string) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}/phases`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ phaseName })
            });

            if (response.ok) {
                const updatedWell = await response.json();
                setAllWells(prev => prev.map(w => w._id === wellId ? updatedWell : w));
                if (activeWell?._id === wellId) setActiveWell(updatedWell);
                if (nextWell?._id === wellId) setNextWell(updatedWell);
                setAddPhaseModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to add phase:', err);
        }
    };

    const handleUpdatePhase = async (wellId: string, phaseIndex: number, newPhaseName: string) => {
        try {
            const well = allWells.find(w => w._id === wellId);
            if (!well) return;

            const updatedWell = { ...well };
            updatedWell.wellPhases[phaseIndex].phaseName = newPhaseName;

            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(updatedWell)
            });

            if (response.ok) {
                const savedWell = await response.json();
                setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));
                if (activeWell?._id === wellId) setActiveWell(savedWell);
                if (nextWell?._id === wellId) setNextWell(savedWell);
                setEditPhaseModalOpen(false);
                setEditingPhase(null);
            }
        } catch (err) {
            console.error('Failed to update phase:', err);
        }
    };

    const handleAddSubPhase = async (wellId: string, phaseIndex: number, subPhaseName: string) => {
        try {
            const well = allWells.find(w => w._id === wellId);
            if (!well) return;

            const updatedWell = { ...well };
            if (!updatedWell.wellPhases[phaseIndex]?.subPhases) {
                updatedWell.wellPhases[phaseIndex].subPhases = [];
            }

            updatedWell.wellPhases[phaseIndex].subPhases.push({
                subPhaseName,
                items: []
            });

            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(updatedWell)
            });

            if (response.ok) {
                const savedWell = await response.json();
                setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));
                if (activeWell?._id === wellId) setActiveWell(savedWell);
                if (nextWell?._id === wellId) setNextWell(savedWell);
                setAddSubPhaseModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to add subphase:', err);
        }
    };

    const handleUpdateSubPhase = async (
        wellId: string,
        phaseIndex: number,
        subPhaseIndex: number,
        newSubPhaseName: string
    ) => {
        try {
            const well = allWells.find(w => w._id === wellId);
            if (!well) return;

            const updatedWell = { ...well };
            updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].subPhaseName = newSubPhaseName;

            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(updatedWell)
            });

            if (response.ok) {
                const savedWell = await response.json();
                setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));
                if (activeWell?._id === wellId) setActiveWell(savedWell);
                if (nextWell?._id === wellId) setNextWell(savedWell);
                setEditSubPhaseModalOpen(false);
                setEditingSubPhase(null);
            }
        } catch (err) {
            console.error('Failed to update subphase:', err);
        }
    };

    const handleAddItem = async (
        wellId: string,
        phaseIndex: number,
        subPhaseIndex: number,
        itemData: any
    ) => {
        try {
            const well = allWells.find(w => w._id === wellId);
            if (!well) return;

            const updatedWell = { ...well };
            if (!updatedWell.wellPhases[phaseIndex]?.subPhases[subPhaseIndex]?.items) {
                updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].items = [];
            }

            updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].items.push(itemData);

            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(updatedWell)
            });

            if (response.ok) {
                const savedWell = await response.json();
                setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));
                if (activeWell?._id === wellId) setActiveWell(savedWell);
                if (nextWell?._id === wellId) setNextWell(savedWell);
                setAddItemModalOpen(false);
            }
        } catch (err) {
            console.error('Failed to add item:', err);
        }
    };

    const handleUpdateItem = async (
        wellId: string,
        phaseIndex: number,
        subPhaseIndex: number,
        itemIndex: number,
        itemData: any
    ) => {
        try {
            const well = allWells.find(w => w._id === wellId);
            if (!well) return;

            const updatedWell = { ...well };
            updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].items[itemIndex] = {
                ...updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].items[itemIndex],
                ...itemData
            };

            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(updatedWell)
            });

            if (response.ok) {
                const savedWell = await response.json();
                setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));
                if (activeWell?._id === wellId) setActiveWell(savedWell);
                if (nextWell?._id === wellId) setNextWell(savedWell);
                setEditItemModalOpen(false);
                setEditingItem(null);
            }
        } catch (err) {
            console.error('Failed to update item:', err);
        }
    };

    const handleUpdateWell = async (wellId: string, wellData: { wellName: string; wellAFE: string }) => {
        try {
            const well = allWells.find(w => w._id === wellId);
            if (!well) return;

            const updatedWell = {
                ...well,
                wellName: wellData.wellName,
                wellAFE: wellData.wellAFE
            };

            const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify(updatedWell)
            });

            if (response.ok) {
                const savedWell = await response.json();

                // Update allWells
                setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));

                // Update activeWell if it's the one being edited
                if (activeWell && activeWell._id === wellId) {
                    setActiveWell(savedWell);
                }

                // Update nextWell if it's the one being edited
                if (nextWell && nextWell._id === wellId) {
                    setNextWell(savedWell);
                }

                // Also update the site data to ensure consistency
                if (currentSite) {
                    const updatedSite = { ...currentSite };

                    // Check if activeWell exists and is an object before accessing _id
                    if (currentSite.activeWell &&
                        typeof currentSite.activeWell === 'object' &&
                        '_id' in currentSite.activeWell &&
                        currentSite.activeWell._id === wellId) {
                        updatedSite.activeWell = savedWell;
                    }

                    // Check if nextWell exists and is an object before accessing _id
                    if (currentSite.nextWell &&
                        typeof currentSite.nextWell === 'object' &&
                        '_id' in currentSite.nextWell &&
                        currentSite.nextWell._id === wellId) {
                        updatedSite.nextWell = savedWell;
                    }

                    setCurrentSite(updatedSite);
                }

                setEditWellModalOpen(false);
                setEditingWell(null);
            }
        } catch (err) {
            console.error('Failed to update well:', err);
        }
    };

    const handleMovePhase = (well: Well, phaseIndex: number, direction: 'up' | 'down') => {
        if (!isAdmin) return;

        const newPhaseIndex = direction === 'up' ? phaseIndex - 1 : phaseIndex + 1;
        if (newPhaseIndex < 0 || newPhaseIndex >= well.wellPhases.length) return;

        const updatedWell = { ...well };
        const phases = [...updatedWell.wellPhases];
        [phases[phaseIndex], phases[newPhaseIndex]] = [phases[newPhaseIndex], phases[phaseIndex]];
        updatedWell.wellPhases = phases;

        fetch(`${API_ENDPOINTS.WELLS}/${well._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify(updatedWell)
        }).then(response => {
            if (response.ok) {
                setAllWells(prev => prev.map(w => w._id === well._id ? updatedWell : w));
                if (activeWell?._id === well._id) setActiveWell(updatedWell);
                if (nextWell?._id === well._id) setNextWell(updatedWell);
            }
        }).catch(err => console.error('Failed to reorder phases:', err));
    };

    const handleMoveSubPhase = (well: Well, phaseIndex: number, subPhaseIndex: number, direction: 'up' | 'down') => {
        if (!isAdmin) return;

        const newSubPhaseIndex = direction === 'up' ? subPhaseIndex - 1 : subPhaseIndex + 1;
        if (newSubPhaseIndex < 0 || newSubPhaseIndex >= well.wellPhases[phaseIndex].subPhases.length) return;

        const updatedWell = { ...well };
        const subPhases = [...updatedWell.wellPhases[phaseIndex].subPhases];
        [subPhases[subPhaseIndex], subPhases[newSubPhaseIndex]] = [subPhases[newSubPhaseIndex], subPhases[subPhaseIndex]];
        updatedWell.wellPhases[phaseIndex].subPhases = subPhases;

        fetch(`${API_ENDPOINTS.WELLS}/${well._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify(updatedWell)
        }).then(response => {
            if (response.ok) {
                setAllWells(prev => prev.map(w => w._id === well._id ? updatedWell : w));
                if (activeWell?._id === well._id) setActiveWell(updatedWell);
                if (nextWell?._id === well._id) setNextWell(updatedWell);
            }
        }).catch(err => console.error('Failed to reorder subphases:', err));
    };

    // Filter wells for search
    const filteredWells = userWells.filter(well =>
        well.wellName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        well.wellAFE.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-container">Loading equipment data...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;

    return (
        <div className="equipment-container">
            {/* Header */}
            <AppBar position="static" className="equipment-header">
                <Toolbar className="header-toolbar">
                    <Box className="header-left">
                        <Typography variant="h6" className="header-title">
                            Wells Equipment List - {userRig}
                        </Typography>

                        {/* Create Well Button */}
                        {isAdmin && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Add />}
                                onClick={() => setCreateWellModalOpen(true)}
                                className="create-well-btn"
                            >
                                New Well
                            </Button>
                        )}
                    </Box>

                    <Box className="header-right">
                        <Box className="dev-credit">
                            <Typography variant="caption">App developed for Wells Team by:</Typography>
                            <Typography variant="caption" className="dev-email">
                                Mike.Belyayev@exxonmobil.com
                            </Typography>
                        </Box>

                        {isAdmin && (
                            <IconButton onClick={() => navigate('/admin')} size="small" className="admin-btn">
                                <Settings />
                            </IconButton>
                        )}

                        <Typography variant="body2" noWrap className="user-name">
                            {user?.userName}
                            {isAdmin && " (admin)"}
                        </Typography>

                        <Button variant="text" onClick={logout} size="small" className="logout-btn">
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Main Content - Split View */}
            <Box className="main-content">
                {/* Active Well Section */}
                <Box className="well-section active-well-section">
                    <Box className="well-header">
                        <Box className="well-title-container">
                            <Typography variant="h6" className="well-title">
                                ACTIVE WELL
                            </Typography>
                            {activeWell && (
                                <>
                                    <Box className="well-name-afe-group">
                                        <Typography variant="h6" className="well-name">
                                            {activeWell.wellName}
                                        </Typography>
                                        <Typography variant="h6" className="well-colon">
                                            :
                                        </Typography>
                                        <Typography variant="h6" className="well-afe">
                                            {activeWell.wellAFE}
                                        </Typography>
                                    </Box>
                                    {/* Edit button after AFE */}
                                    {isAdmin && (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditingWell(activeWell);
                                                setEditWellModalOpen(true);
                                            }}
                                            className="well-edit-btn"
                                            title="Edit Well"
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    )}
                                </>
                            )}
                        </Box>

                        <Box className="well-header-controls">
                            <Button
                                size="small"
                                startIcon={<Search />}
                                onClick={(e) => {
                                    setWellSearchAnchor(e.currentTarget);
                                    setWellSearchType('active');
                                    setSearchTerm('');
                                }}
                                className="assign-well-btn"
                                disabled={userWells.length === 0}
                            >
                                {activeWell ? 'Change' : 'Assign Well'}
                            </Button>

                            {/* Add Phase Button in header */}
                            {isAdmin && activeWell && (
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={() => {
                                        setSelectedWellForPhase(activeWell);
                                        setAddPhaseModalOpen(true);
                                    }}
                                    className="add-phase-header-btn"
                                >
                                    Phase
                                </Button>
                            )}

                            {/* Column selector */}
                            <FormControl size="small" className="column-selector">
                                <Select
                                    value={activeWellColumns}
                                    onChange={(e) => setActiveWellColumns(Number(e.target.value))}
                                    displayEmpty
                                >
                                    {[1, 2, 3, 4].map(num => (
                                        <MenuItem key={num} value={num}>{num} col</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {activeWell ? (
                        <WellColumn
                            well={activeWell}
                            columnCount={activeWellColumns}
                            onAddPhase={(well) => {
                                setSelectedWellForPhase(well);
                                setAddPhaseModalOpen(true);
                            }}
                            onAddSubPhase={(well, phaseIndex) => {
                                setSelectedPhaseForSubPhase({ well, phaseIndex });
                                setAddSubPhaseModalOpen(true);
                            }}
                            onAddItem={(well, phaseIndex, subPhaseIndex) => {
                                setSelectedPhaseForItem({ well, phaseIndex, subPhaseIndex });
                                setAddItemModalOpen(true);
                            }}
                            onEditPhase={(well, phaseIndex, phaseName) => {
                                setEditingPhase({ well, phaseIndex, phaseName });
                                setEditPhaseModalOpen(true);
                            }}
                            onEditSubPhase={(well, phaseIndex, subPhaseIndex, subPhaseName) => {
                                setEditingSubPhase({ well, phaseIndex, subPhaseIndex, subPhaseName });
                                setEditSubPhaseModalOpen(true);
                            }}
                            onEditItem={(well, phaseIndex, subPhaseIndex, itemIndex, item) => {
                                setEditingItem({ well, phaseIndex, subPhaseIndex, itemIndex, item });
                                setEditItemModalOpen(true);
                            }}
                            onMovePhase={handleMovePhase}
                            onMoveSubPhase={handleMoveSubPhase}
                            isAdmin={isAdmin}
                        />
                    ) : (
                        <Box className="empty-well-message">
                            <Typography>No active well assigned for {userRig}</Typography>
                            {userWells.length === 0 && (
                                <Typography variant="caption" sx={{ mt: 1, color: '#999' }}>
                                    Create a new well first
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Vertical Divider */}
                <Divider orientation="vertical" flexItem className="wells-divider" />

                {/* Next Well Section */}
                <Box className="well-section next-well-section">
                    <Box className="well-header">
                        <Box className="well-title-container">
                            <Typography variant="h6" className="well-title">
                                NEXT WELL
                            </Typography>
                            {nextWell && (
                                <>
                                    <Box className="well-name-afe-group">
                                        <Typography variant="h6" className="well-name">
                                            {nextWell.wellName}
                                        </Typography>
                                        <Typography variant="h6" className="well-colon">
                                            :
                                        </Typography>
                                        <Typography variant="h6" className="well-afe">
                                            {nextWell.wellAFE}
                                        </Typography>
                                    </Box>
                                    {/* Edit button after AFE */}
                                    {isAdmin && (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditingWell(nextWell);
                                                setEditWellModalOpen(true);
                                            }}
                                            className="well-edit-btn"
                                            title="Edit Well"
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    )}
                                </>
                            )}
                        </Box>

                        <Box className="well-header-controls">
                            <Button
                                size="small"
                                startIcon={<Search />}
                                onClick={(e) => {
                                    setWellSearchAnchor(e.currentTarget);
                                    setWellSearchType('next');
                                    setSearchTerm('');
                                }}
                                className="assign-well-btn"
                                disabled={userWells.length === 0}
                            >
                                {nextWell ? 'Change' : 'Assign Well'}
                            </Button>

                            {/* Add Phase Button in header */}
                            {isAdmin && nextWell && (
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={() => {
                                        setSelectedWellForPhase(nextWell);
                                        setAddPhaseModalOpen(true);
                                    }}
                                    className="add-phase-header-btn"
                                >
                                    Phase
                                </Button>
                            )}

                            {/* Column selector */}
                            <FormControl size="small" className="column-selector">
                                <Select
                                    value={nextWellColumns}
                                    onChange={(e) => setNextWellColumns(Number(e.target.value))}
                                    displayEmpty
                                >
                                    {[1, 2, 3, 4].map(num => (
                                        <MenuItem key={num} value={num}>{num} col</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {nextWell ? (
                        <WellColumn
                            well={nextWell}
                            columnCount={nextWellColumns}
                            onAddPhase={(well) => {
                                setSelectedWellForPhase(well);
                                setAddPhaseModalOpen(true);
                            }}
                            onAddSubPhase={(well, phaseIndex) => {
                                setSelectedPhaseForSubPhase({ well, phaseIndex });
                                setAddSubPhaseModalOpen(true);
                            }}
                            onAddItem={(well, phaseIndex, subPhaseIndex) => {
                                setSelectedPhaseForItem({ well, phaseIndex, subPhaseIndex });
                                setAddItemModalOpen(true);
                            }}
                            onEditPhase={(well, phaseIndex, phaseName) => {
                                setEditingPhase({ well, phaseIndex, phaseName });
                                setEditPhaseModalOpen(true);
                            }}
                            onEditSubPhase={(well, phaseIndex, subPhaseIndex, subPhaseName) => {
                                setEditingSubPhase({ well, phaseIndex, subPhaseIndex, subPhaseName });
                                setEditSubPhaseModalOpen(true);
                            }}
                            onEditItem={(well, phaseIndex, subPhaseIndex, itemIndex, item) => {
                                setEditingItem({ well, phaseIndex, subPhaseIndex, itemIndex, item });
                                setEditItemModalOpen(true);
                            }}
                            onMovePhase={handleMovePhase}
                            onMoveSubPhase={handleMoveSubPhase}
                            isAdmin={isAdmin}
                        />
                    ) : (
                        <Box className="empty-well-message">
                            <Typography>No next well assigned for {userRig}</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Well Search Popover */}
            <Popover
                open={Boolean(wellSearchAnchor)}
                anchorEl={wellSearchAnchor}
                onClose={() => setWellSearchAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box className="well-search-popover">
                    <TextField
                        size="small"
                        placeholder="Search wells..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        fullWidth
                    />
                    <Box className="well-search-results">
                        {filteredWells.length > 0 ? (
                            filteredWells.map(well => (
                                <MenuItem
                                    key={well._id}
                                    onClick={() => wellSearchType && handleAssignWell(well, wellSearchType)}
                                    className="well-search-item"
                                >
                                    <Typography variant="body2" className="well-search-name">
                                        {well.wellName}
                                    </Typography>
                                    <Typography variant="caption" className="well-search-afe">
                                        {well.wellAFE}
                                    </Typography>
                                </MenuItem>
                            ))
                        ) : (
                            <Typography variant="body2" className="no-results">
                                No wells found for {userRig}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Popover>

            {/* Modals */}
            <CreateWellModal
                isOpen={createWellModalOpen}
                onClose={() => setCreateWellModalOpen(false)}
                onSubmit={handleCreateWell}
                currentLocation={userRig}
            />

            <AddPhaseModal
                isOpen={addPhaseModalOpen}
                onClose={() => {
                    setAddPhaseModalOpen(false);
                    setSelectedWellForPhase(null);
                }}
                well={selectedWellForPhase}
                onSubmit={handleAddPhase}
            />

            <AddSubPhaseModal
                isOpen={addSubPhaseModalOpen}
                onClose={() => {
                    setAddSubPhaseModalOpen(false);
                    setSelectedPhaseForSubPhase(null);
                }}
                phaseInfo={selectedPhaseForSubPhase}
                onSubmit={handleAddSubPhase}
            />

            <AddItemModal
                isOpen={addItemModalOpen}
                onClose={() => {
                    setAddItemModalOpen(false);
                    setSelectedPhaseForItem(null);
                }}
                phaseInfo={selectedPhaseForItem}
                onSubmit={handleAddItem}
            />

            <EditPhaseModal
                isOpen={editPhaseModalOpen}
                onClose={() => {
                    setEditPhaseModalOpen(false);
                    setEditingPhase(null);
                }}
                phaseInfo={editingPhase}
                onSubmit={handleUpdatePhase}
            />

            <EditSubPhaseModal
                isOpen={editSubPhaseModalOpen}
                onClose={() => {
                    setEditSubPhaseModalOpen(false);
                    setEditingSubPhase(null);
                }}
                subPhaseInfo={editingSubPhase}
                onSubmit={handleUpdateSubPhase}
            />

            <EditItemModal
                isOpen={editItemModalOpen}
                onClose={() => {
                    setEditItemModalOpen(false);
                    setEditingItem(null);
                }}
                itemInfo={editingItem}
                onSubmit={handleUpdateItem}
            />

            <EditWellModal
                isOpen={editWellModalOpen}
                onClose={() => {
                    setEditWellModalOpen(false);
                    setEditingWell(null);
                }}
                well={editingWell}
                onSubmit={handleUpdateWell}
            />
        </div>
    );
};

export default EquipmentPage;
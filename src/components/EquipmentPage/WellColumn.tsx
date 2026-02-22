// src/components/EquipmentPage/WellColumn.tsx
import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Add, ArrowUpward, ArrowDownward, Edit } from '@mui/icons-material';
import type { Well, Item } from '../../types';
import './WellColumn.css';

interface WellColumnProps {
  well: Well;
  columnCount: number;
  onAddPhase: (well: Well) => void;
  onAddSubPhase: (well: Well, phaseIndex: number) => void;
  onAddItem: (well: Well, phaseIndex: number, subPhaseIndex: number) => void;
  onEditPhase: (well: Well, phaseIndex: number, phaseName: string) => void;
  onEditSubPhase: (well: Well, phaseIndex: number, subPhaseIndex: number, subPhaseName: string) => void;
  onEditItem: (well: Well, phaseIndex: number, subPhaseIndex: number, itemIndex: number, item: Item) => void;
  onMovePhase: (well: Well, phaseIndex: number, direction: 'up' | 'down') => void;
  onMoveSubPhase: (well: Well, phaseIndex: number, subPhaseIndex: number, direction: 'up' | 'down') => void;
  isAdmin: boolean;
}

const WellColumn: React.FC<WellColumnProps> = ({
  well,
  columnCount,
  onAddPhase,
  onAddSubPhase,
  onAddItem,
  onEditPhase,
  onEditSubPhase,
  onEditItem,
  onMovePhase,
  onMoveSubPhase,
  isAdmin
}) => {
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Calculate grid column class based on columnCount
  const getGridClass = () => {
    switch(columnCount) {
      case 1: return 'single-column';
      case 2: return 'two-columns';
      case 3: return 'three-columns';
      case 4: return 'four-columns';
      default: return 'two-columns';
    }
  };

  return (
    <Box className="well-column">
      {/* Phases Container with dynamic columns */}
      <Box className={`phases-container ${getGridClass()}`}>
        {well.wellPhases?.map((phase, phaseIndex) => (
          <Box key={phaseIndex} className="phase-card">
            <Box className="phase-header">
              <Typography variant="subtitle2" className="phase-name">
                {phase.phaseName}
              </Typography>
              
              {/* Phase controls */}
              {isAdmin && (
                <Box className="phase-controls">
                  <IconButton 
                    size="small" 
                    onClick={() => onEditPhase(well, phaseIndex, phase.phaseName)}
                    className="edit-btn"
                    title="Edit Phase"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onMovePhase(well, phaseIndex, 'up')}
                    disabled={phaseIndex === 0}
                    className="move-btn"
                    title="Move Up"
                  >
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onMovePhase(well, phaseIndex, 'down')}
                    disabled={phaseIndex === well.wellPhases.length - 1}
                    className="move-btn"
                    title="Move Down"
                  >
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onAddSubPhase(well, phaseIndex)}
                    className="add-subphase-btn"
                    title="Add Subphase"
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Subphases - always expanded */}
            <Box className="subphases-container">
              {phase.subPhases?.map((subPhase, subPhaseIndex) => (
                <Box key={subPhaseIndex} className="subphase-card">
                  <Box className="subphase-header">
                    <Typography variant="body2" className="subphase-name">
                      {subPhase.subPhaseName}
                    </Typography>
                    
                    {/* Subphase controls */}
                    {isAdmin && (
                      <Box className="subphase-controls">
                        <IconButton 
                          size="small" 
                          onClick={() => onEditSubPhase(well, phaseIndex, subPhaseIndex, subPhase.subPhaseName)}
                          className="edit-btn"
                          title="Edit Subphase"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onMoveSubPhase(well, phaseIndex, subPhaseIndex, 'up')}
                          disabled={subPhaseIndex === 0}
                          className="move-btn"
                          title="Move Up"
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onMoveSubPhase(well, phaseIndex, subPhaseIndex, 'down')}
                          disabled={subPhaseIndex === phase.subPhases.length - 1}
                          className="move-btn"
                          title="Move Down"
                        >
                          <ArrowDownward fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onAddItem(well, phaseIndex, subPhaseIndex)}
                          className="add-item-btn"
                          title="Add Item"
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Items */}
                  <Box className="items-container">
                    {subPhase.items?.map((item, itemIndex) => (
                      <Box key={itemIndex} className="item-card">
                        <Box 
                          className="item-content" 
                          onClick={() => toggleItem(`${phaseIndex}-${subPhaseIndex}-${itemIndex}`)}
                        >
                          {item.itemQuantity && (
                            <Typography variant="caption" className="item-quantity">
                              {item.itemQuantity}
                            </Typography>
                          )}
                          
                          <Typography 
                            variant="body2" 
                            className={`item-name ${expandedItems[`${phaseIndex}-${subPhaseIndex}-${itemIndex}`] ? 'expanded' : ''}`}
                          >
                            {item.itemName}
                          </Typography>

                          {item.itemLocation && (
                            <Typography variant="caption" className="item-location">
                              {item.itemLocation}
                            </Typography>
                          )}

                          {/* Edit button for item */}
                          {isAdmin && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditItem(well, phaseIndex, subPhaseIndex, itemIndex, item);
                              }}
                              className="item-edit-btn"
                              title="Edit Item"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                        </Box>

                        {expandedItems[`${phaseIndex}-${subPhaseIndex}-${itemIndex}`] && (
                          <Box className="item-details">
                            {item.itemDescription && (
                              <Typography variant="caption" className="item-description">
                                {item.itemDescription}
                              </Typography>
                            )}
                            {item.itemState && (
                              <Typography variant="caption" className="item-state">
                                State: {item.itemState}
                              </Typography>
                            )}
                            {item.itemComment && (
                              <Typography variant="caption" className="item-comment">
                                Note: {item.itemComment}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WellColumn;
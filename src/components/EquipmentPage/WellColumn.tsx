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

  const toggleItem = (itemKey: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
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

  // Get status colors based on item state
  const getStatusColors = (status?: string) => {
    switch(status) {
      case 'green':
        return {
          background: 'rgba(76, 175, 80, 0.15)',
          text: '#2e7d32',
          border: 'rgba(76, 175, 80, 0.3)'
        };
      case 'orange':
        return {
          background: 'rgba(255, 152, 0, 0.15)',
          text: '#c43e00',
          border: 'rgba(255, 152, 0, 0.3)'
        };
      case 'red':
        return {
          background: 'rgba(244, 67, 54, 0.15)',
          text: '#b71c1c',
          border: 'rgba(244, 67, 54, 0.3)'
        };
      default:
        return {
          background: 'transparent',
          text: 'inherit',
          border: 'none'
        };
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
                    {subPhase.items?.map((item, itemIndex) => {
                      const itemKey = `${phaseIndex}-${subPhaseIndex}-${itemIndex}`;
                      const isExpanded = expandedItems[itemKey];
                      const statusColors = getStatusColors(item.itemState);
                      
                      return (
                        <Box key={itemIndex} className="item-card">
                          {!isExpanded ? (
                            /* Collapsed view - horizontal layout */
                            <Box 
                              className="item-content collapsed"
                              onClick={() => toggleItem(itemKey)}
                              sx={{ backgroundColor: statusColors.background }}
                            >
                              {item.itemQuantity && (
                                <Typography variant="caption" className="item-quantity">
                                  {item.itemQuantity}
                                </Typography>
                              )}
                              
                              <Typography 
                                variant="body2" 
                                className="item-name"
                                sx={{ color: statusColors.text }}
                              >
                                {item.itemName}
                              </Typography>

                              {item.itemLocation && (
                                <Typography variant="caption" className="item-location">
                                  {item.itemLocation}
                                </Typography>
                              )}

                              {/* Edit button */}
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
                          ) : (
                            /* Expanded view - vertical layout */
                            <Box 
                              className="item-content expanded"
                              onClick={() => toggleItem(itemKey)}
                              sx={{ backgroundColor: statusColors.background }}
                            >
                              {/* Top row: Quantity only */}
                              <Box className="item-expanded-top">
                                {item.itemQuantity && (
                                  <Typography variant="caption" className="item-expanded-quantity">
                                    Quantity: {item.itemQuantity}
                                  </Typography>
                                )}
                                
                                {/* Edit button moved to top right */}
                                {isAdmin && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditItem(well, phaseIndex, subPhaseIndex, itemIndex, item);
                                    }}
                                    className="item-expanded-edit-btn"
                                    title="Edit Item"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>

                              {/* Item Name - full width, left aligned */}
                              <Typography 
                                variant="body2" 
                                className="item-expanded-name"
                                sx={{ color: statusColors.text }}
                              >
                                {item.itemName}
                              </Typography>

                              {/* Description - grey cursive */}
                              {item.itemDescription && (
                                <Typography variant="caption" className="item-expanded-description">
                                  {item.itemDescription}
                                </Typography>
                              )}

                              {/* Bottom row: Location */}
                              {item.itemLocation && (
                                <Box className="item-expanded-bottom">
                                  <Typography variant="caption" className="item-expanded-location">
                                    <strong>Location:</strong> {item.itemLocation}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
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
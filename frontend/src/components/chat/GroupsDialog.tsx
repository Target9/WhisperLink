import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { MultiSelectCombobox, type ComboboxOption } from '../ui/combobox';
import { FolderPlus, Users, Plus, Trash2, Edit } from 'lucide-react';
import type { Chat, Group } from '../../types';

interface GroupsDialogProps {
  chats: Chat[];
  groups: Group[];
  onCreateGroup: (name: string, description: string, chatIds: string[]) => void;
  onUpdateGroup: (groupId: string, name: string, description: string, chatIds: string[]) => void;
  onDeleteGroup: (groupId: string) => void;
  trigger?: React.ReactNode;
}

export const GroupsDialog: React.FC<GroupsDialogProps> = ({
  chats,
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  trigger
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);

  const defaultTrigger = (
    <Button variant="ghost" size="icon" title="Groups">
      <FolderPlus className="h-4 w-4" />
    </Button>
  );

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim(), groupDescription.trim(), selectedChatIds);
      resetForm();
    }
  };

  const handleUpdateGroup = () => {
    if (editingGroup && groupName.trim()) {
      onUpdateGroup(editingGroup.id, groupName.trim(), groupDescription.trim(), selectedChatIds);
      resetForm();
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setSelectedChatIds(group.chatIds);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setSelectedChatIds([]);
  };

  const handleChatSelectionChange = (selectedIds: string[]) => {
    setSelectedChatIds(selectedIds);
  };

  const chatOptions: ComboboxOption[] = chats.map(chat => ({
    value: chat.id,
    label: chat.address
  }));

  const getChatsInGroup = (group: Group) => {
    return chats.filter(chat => group.chatIds.includes(chat.id));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Groups
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Create/Edit Group Form */}
            {isCreating && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingGroup ? 'Edit Group' : 'Create New Group'}
                  </CardTitle>
                  <CardDescription>
                    {editingGroup ? 'Update group details and chat assignments' : 'Organize your chats into groups'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="group-name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                      className="bg-background border-0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      id="group-description"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Enter group description"
                      rows={2}
                      className="bg-background border-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select Chats</Label>
                    <MultiSelectCombobox
                      options={chatOptions}
                      selectedValues={selectedChatIds}
                      onSelectionChange={handleChatSelectionChange}
                      placeholder="Select chats to add to group..."
                      searchPlaceholder="Search chats..."
                      emptyMessage="No chats found."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}>
                      {editingGroup ? 'Update Group' : 'Create Group'}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Groups List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Groups</h3>
                {!isCreating && (
                  <Button onClick={() => setIsCreating(true)} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Group
                  </Button>
                )}
              </div>

              {groups.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No groups yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first group to organize your chats
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => {
                    const groupChats = getChatsInGroup(group);
                    return (
                      <Card key={group.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <CardTitle className="text-base">{group.name}</CardTitle>
                              <Badge variant="secondary">
                                {groupChats.length} chats
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditGroup(group)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => onDeleteGroup(group.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {group.description && (
                            <CardDescription>{group.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {groupChats.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No chats in this group
                              </p>
                            ) : (
                              groupChats.map((chat) => (
                                <div
                                  key={chat.id}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                >
                                  <span className="truncate">{chat.address}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {chat.messages.length} messages
                                  </Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

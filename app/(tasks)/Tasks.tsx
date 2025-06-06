import { auth, db } from '@/firebaseConfig';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Portal } from 'react-native-portalize';
const Tasks = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [status, setStatus] = useState<string>('Pending');
  const [filteredTasks, setFilterTasks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<any>(null);

  const priorityOrder: any = {
    High: 1,
    Medium: 2,
    Low: 3,
  };
  useEffect(() => {
    try {
      const dataFetcher = async () => {
        const userUid: any = auth.currentUser?.uid;
        console.log(userUid);
        const docRef = doc(db, "users", userUid);
        const val = await getDoc(docRef);
        if (val.exists()) {
          setTasks(val.data()?.tasks);
          console.log(val.data()?.tasks);
        }
      }
      dataFetcher()
    }
    catch (error) {
      console.log(error)
    }
  }, [])
  useEffect(() => {
    try {
      if (title !== '' && description !== '' && date !== '') {

        const taskUpdater = async () => {
          const userUid: any = auth.currentUser?.uid;
          console.log(userUid);
          const docRef = doc(db, "users", userUid);
          await updateDoc(docRef, {
            tasks: tasks,
          });
          setTitle('');
          setDescription('');
          setPriority('Medium');
          setDate('');
        }
        taskUpdater()
      }
    } catch (error) {
      console.log(error)
    }
  }, [tasks])

  useEffect(() => {
    if (searchQuery === '') {

      const today = new Date().toISOString().split('T')[0];

      // Filter for today or future dates
      const upcomingTasks = tasks.filter(task => task.date >= today);

      // Sort by priority
      const sortedTasks = upcomingTasks.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      const filtered =
        filter === 'All' ? sortedTasks : sortedTasks.filter((task) => task.status === filter);
      setFilterTasks(filtered)
    }
    else {
      const filtered = tasks.filter((task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilterTasks(filtered)
    }
  }, [filter, tasks, searchQuery])



  const handleCreateTask = () => {
    if (title && description && priority && date) {
      const newTask = { title: title.trim(), description: description.trim(), priority, date, status, taskId: Date.now() };
      setTasks([...tasks, newTask]);
      console.log(newTask)
      setModalVisible(false);
      // setTitle('');
      // setDescription('');
      // setPriority('Medium');
      // setDate('');
    }
    else {
      alert('Please fill all the fields')
    }
  }

  const createNewTask = () => {
    try {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDate('');
      setStatus('Pending');
      setSelectedTaskIndex(null);
      setIsEditing(false);
      setModalVisible(true);
      console.log('Add Task Pressed')
    } catch (error) {

    }
  }

  const statusSetter = (taskId: any, status: any) => {
    try {
      const index = tasks.findIndex(task => task.taskId === taskId);
      if (index === -1) {
        console.error('Task not found');
        return;
      }
      setStatus(status);
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        updatedTasks[index].status = status;
        return updatedTasks;
      })

    } catch (error) {
      console.log(error)
    }
  }

  const deleteTask = async (taskId: any) => {
    try {
      const index = tasks.findIndex(task => task.taskId === taskId);
      if (index === -1) {
        console.error('Task not found');
        return;
      }
  
      const updatedTasks = [...tasks];
      updatedTasks.splice(index, 1);
  
      setTasks(updatedTasks); // update UI
  
      const userUid: any = auth.currentUser?.uid;
      const docRef = doc(db, "users", userUid);
      await updateDoc(docRef, {
        tasks: updatedTasks, // update in Firestore
      });
    } catch (error) {
      console.log(error);
    }
  };
  const updateTask = () => {
    try {
      console.log(selectedTaskIndex, title, description, priority, date)

      if (selectedTaskIndex !== null && title && description && priority && date) {

        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks];
          updatedTasks[selectedTaskIndex].status = status;
          updatedTasks[selectedTaskIndex].title = title;
          updatedTasks[selectedTaskIndex].description = description;
          updatedTasks[selectedTaskIndex].priority = priority;
          updatedTasks[selectedTaskIndex].date = date;
          updatedTasks[selectedTaskIndex].taskId = Date.now();

          return updatedTasks;
        })
        console.log(tasks)
        setModalVisible(false);
        // setTitle('');
        // setDescription('');
        // setPriority('Medium');
        // setDate('');
        setSelectedTaskIndex(null);
      }
      else {
        alert('Please fill all the fields')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onClickEdit = (taskId: any) => {
    try {
      const index = tasks.findIndex(task => task.taskId === taskId);
      if (index === -1) {
        console.error('Task not found');
        return;
      }

      setSelectedTaskIndex(index)
      setModalVisible(true);
      setIsEditing(true);
    } catch (error) {
      console.log(error)
    }
  }
  return (

    <View style={styles.container} >

      <Modal visible={modalVisible} animationType="slide" transparent style={styles.modal} >
        <View style={styles.overlay}  >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerTitle}>Create New Task</Text>
              <Pressable onPress={() => { setModalVisible(false); setIsEditing(false) }}>
                <Ionicons name="close" size={24} />
              </Pressable>
            </View>

            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Task Description</Text>
            <TextInput

              style={[styles.input, styles.textArea]}
              placeholder="Add details about this task."
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {['High', 'Medium', 'Low'].map((level) => {

                const isSelected = priority === level;

                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => { setPriority(level as any); Keyboard.dismiss() }}
                    style={[
                      styles.priorityButton,
                      isSelected && styles.selectedPriorityButton,
                      level === 'High' && isSelected && { backgroundColor: '#ef4444' },
                      level === 'Medium' && isSelected && { backgroundColor: '#facc15' },
                      level === 'Low' && isSelected && { backgroundColor: '#10b981' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        isSelected && styles.selectedPriorityText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Due Date</Text>
            <Calendar
              current={selectedTaskIndex !== null ? tasks[selectedTaskIndex].date : date}
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={(day: any) => setDate(day.dateString)}
              markedDates={{
                [date]: { selected: true, selectedColor: '#3b82f6' },
              }}
              theme={{
                todayTextColor: '#3b82f6',
                selectedDayBackgroundColor: '#3b82f6',
              }}
              style={styles.calendar}
            />
            <TouchableOpacity style={styles.createButton} onPress={isEditing ? updateTask : handleCreateTask}>
              {isEditing ? <Text style={styles.createButtonText}>Update Task</Text> : <Text style={styles.createButtonText}>Create Task</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search Bar */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search tasks by title"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 30 }}>Today, {new Date().getDate()} {new Date().toLocaleString('default', { month: 'long' })}</Text>
      </View>


      <View style={styles.cardContainer}>
        {/* Filter Buttons */}
        <View style={styles.filters}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>Your Tasks</Text>
          <View style={{ flexDirection: 'row' }}>
            {['All', 'Pending', 'Completed'].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterButton,
                  filter === item && styles.activeFilter,
                ]}
              >
                <Text style={[styles.filterText, filter === item && styles.activeFilterText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Task Cards */}
        {tasks.length === 0 ? (
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'gray', textAlign: 'center', marginTop: 20 }}>No tasks found.</Text>
        ) : (<FlatList
          data={filteredTasks}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item, index }) => (
            <View key={index} style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'flex-start', width: '100%', gap: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', }}>
              <Pressable
                onPress={() => { statusSetter(item.taskId, item.status === 'Completed' ? 'Pending' : 'Completed') }}
                style={styles.checkboxContainer}
              >
                <View style={[styles.checkbox, item.status === 'Completed' && styles.checkedBox]}>
                  {item.status === 'Completed' && <Text style={styles.checkMark}>✔</Text>}
                </View>
              </Pressable>
              <View style={{ width: '70%' }}>
                <View style={styles.cardHeader}>
                  <Text
                    style={[
                      styles.taskTitle,
                      item.status === 'Completed' && styles.completedText,
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.tag, item.priority === 'High' ? styles.highTag : item.priority === 'Medium' ? styles.mediumTag : styles.lowTag]}>
                    {item.priority}
                  </Text>
                  <Text style={styles.dateText}>📅 {item?.date}</Text>
                  <Text style={[styles.statusTag, item.status === 'Completed' && styles.completedStatus]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{}} onPress={() => { console.log('Edit Task Pressed'); onClickEdit(item.taskId) }}>
                  <MaterialCommunityIcons name="pen-plus" size={24} color="black" />

                </TouchableOpacity>
                <TouchableOpacity style={{ paddingRight: 20 }} onPress={() => deleteTask(item.taskId)}>
                  <Octicons name="trash" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />)}

      </View>
      <Portal>
        <Pressable style={styles.footer} onPress={createNewTask}>
          <AntDesign name="plus" size={50} color="white" />
        </Pressable>
      </Portal>
    </View>
  )
}
const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    // zIndex: 30
    position: 'fixed',
    bottom: 0,
  },
  taskContainer: {
    width: '100%',
    flex: 1,
    padding: 10,
    gap: 20
  },
  task: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: '20%',
    backgroundColor: '#868BF1',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    position: 'relative',
    marginBottom: 20
  },
  tasks: {
    width: '100%',
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#868BF1',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 35,
    position: 'absolute',
    zIndex: 20,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',

  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedPriorityButton: {
    borderColor: 'transparent',
  },
  priorityText: {
    color: '#374151',
    fontWeight: '600',
  },
  selectedPriorityText: {
    color: 'white',
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'flex-start',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 12,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    // width: '60%',
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    overflow: 'hidden',
  },
  highTag: {
    backgroundColor: '#ef4444',
  },
  mediumTag: {
    backgroundColor: '#f59e0b',
  },
  lowTag: {
    backgroundColor: '#60a5fa',
  },
  dateText: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 8,
  },
  statusTag: {
    // width: 80,
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#d1d5db',
    color: '#1f2937',
    textAlign: 'center',
  },
  completedStatus: {
    backgroundColor: '#10b981',
    color: '#fff',
  },
  trashIcon: {
    marginLeft: 8,
    color: '#ef4444',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingLeft: 20
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 50,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  checkedBox: {
    backgroundColor: 'green',
  },
  checkMark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxlabel: {
    fontSize: 16,
    color: '#333',
    // textDecorationLine: 'line-through'
  },
  searchBar: {
    width: "80%",
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 50,
    backgroundColor: '#fff',
  },
})
export default Tasks
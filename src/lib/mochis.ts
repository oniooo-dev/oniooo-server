import supabase from '../configs/supabase/supabase';

// Adding Mochis
export async function addMochiBalance(userId: string, amount: number) {
    const { data, error } = await supabase.rpc('add_mochi_balance', { 
      target_user_id: userId,
      amount: amount
    });
  
    if (error) {
      console.error('Supabase RPC error:', error);
      return { success: false, message: 'Failed to communicate with the server' };
    }
  
    if (data && data.length > 0) {
      return { success: data[0].success, message: data[0].message };
    } else {
      return { success: false, message: 'Unexpected response from server' };
    }
  }

// Decreasing Mochis
export async function decreaseMochiBalance(userId: string, amount: number) {
    const { data, error } = await supabase.rpc('decrease_mochi_balance', { 
      target_user_id: userId,
      amount: amount
    });
  
    if (error) {
      console.error('Supabase RPC error:', error);
      return { success: false, message: 'Failed to communicate with the server' };
    }
  
    if (data && data.length > 0) {
      return { success: data[0].success, message: data[0].message };
    } else {
      return { success: false, message: 'Unexpected response from server' };
    }
  }

// Usage
// async function handleMochiTransaction() {
//     const result = await addMochiBalance('user-uuid', 100);
//     if (result.success) {
//       console.log('Mochi added successfully:', result.message);
//       // Proceed with success logic
//     } else {
//       console.error('Failed to add Mochi:', result.message);
//       // Handle failure, perhaps initiate a refund if applicable
//     }
  
//     const decreaseResult = await decreaseMochiBalance('user-uuid', 50);
//     if (decreaseResult.success) {
//       console.log('Mochi decreased successfully:', decreaseResult.message);
//       // Proceed with success logic
//     } else {
//       console.error('Failed to decrease Mochi:', decreaseResult.message);
//       // Handle failure, perhaps reverse a transaction or notify the user
//     }
//   }
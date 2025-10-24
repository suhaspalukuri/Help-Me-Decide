import { DecisionBoard, User } from '../types';
import { supabase } from './supabaseClient';

const NOT_CONFIGURED_ERROR = { success: false, error: "Database not configured. Add credentials to services/supabaseClient.ts" };

// --- Auth Management ---

export const logoutUser = async (): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
    }
};

export const getCurrentUser = async (): Promise<string | null> => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.email || null;
};

// --- User Data Management ---

export const getCurrentUserProfile = async (): Promise<User | null> => {
    if (!supabase) return null;
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
        return null;
    }

    const { data: userProfile, error } = await supabase.from('users')
        // Fix: Select all fields required by the User type to resolve TypeScript error.
        .select('id, name, email, securityQuestion, securityAnswer')
        .eq('id', authUser.id)
        .single();

    if (error) {
        // It's okay if no profile is found, but log other errors.
        if (error.code !== 'PGRST116') {
             console.error("Error fetching current user profile:", error.message);
        }
        return null;
    }
    
    return userProfile;
};

export const getUsers = async (): Promise<User[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('users').select('id, name, email, securityQuestion, securityAnswer');
    if (error) {
        console.error("Error fetching users:", error.message);
        return [];
    }
    return (data as any[]) || [];
};

const getUserByEmail = async (email: string): Promise<User | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Ignore "no rows found" error
            console.error("Error fetching user by email:", error.message);
        }
        return null;
    }
    return data;
}

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return NOT_CONFIGURED_ERROR;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
    });

    if (authError) {
        return { success: false, error: "Hmm, that email or password doesn't look right." };
    }

    if (authData.user) {
        // After successful login, check if a public profile exists. This prevents users
        // from getting stuck if their profile creation failed during signup.
        const { error: profileError } = await supabase
            .from('users')
            .select('id')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            // If the profile is missing (PGRST116: No rows found), log the user out
            // and return a specific error message.
            if (profileError.code === 'PGRST116') {
                await supabase.auth.signOut();
                return { success: false, error: "Your account profile is missing. Please sign up again to create it." };
            }
            // For any other database error, log out and show a generic error.
            await supabase.auth.signOut();
            console.error("Profile check error after login:", profileError.message);
            return { success: false, error: "An error occurred while checking your profile." };
        }
    } else {
        // This case should not be hit if authError is null, but it's a useful safeguard.
        return { success: false, error: "Could not retrieve user details after login." };
    }

    return { success: true };
};

export const signupUser = async (userData: User): Promise<{ success: boolean; error?: string; requiresConfirmation?: boolean }> => {
    if (!supabase) return NOT_CONFIGURED_ERROR;

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.trim().toLowerCase(),
        password: userData.password!,
    });

    if (authError) {
        return { success: false, error: "Looks like that email is already in use. Try signing in!" };
    }
    
    if (!authData.user) {
        return { success: false, error: 'Could not create user account.' };
    }

    const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: userData.email.toLowerCase(),
        name: userData.name.trim(),
        securityQuestion: userData.securityQuestion,
        securityAnswer: userData.securityAnswer.trim(),
    });

    if (userError) {
        console.error("Error creating public user profile:", userError.message);
        return { success: false, error: 'Could not save user profile.' };
    }

    const requiresConfirmation = authData.session === null;
    return { success: true, requiresConfirmation };
};

export const getSecurityQuestionForEmail = async (email: string): Promise<string | null> => {
    if (!supabase) return null;
    const user = await getUserByEmail(email);
    return user ? user.securityQuestion : null;
};

export const resetPassword = async (email: string, securityAnswer: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return NOT_CONFIGURED_ERROR;
    
    // SECURITY WARNING: This custom flow is highly insecure and will not work against
    // a production Supabase instance without a custom Edge Function. It relies on
    // checking the security answer on the client, which is unsafe. The standard,
    // secure flow is to use `supabase.auth.resetPasswordForEmail()`.
    
    const user = await getUserByEmail(email.toLowerCase());

    if (!user) {
        return { success: false, error: "We couldn't find an account with that email." };
    }

    if (user.securityAnswer !== securityAnswer) {
        return { success: false, error: "That's not the answer we have on file. Please try again." };
    }
    
    alert("This is an insecure demo flow. In a real app, you would be sent a secure link to reset your password.");
    return { success: false, error: "Password reset is not securely implemented in this demo." };
};


// --- Board Management ---

export const getBoards = async (): Promise<DecisionBoard[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error) {
        console.error('Error fetching boards:', error.message);
        return [];
    }
    return data || [];
};

export const createBoard = async (boardData: Omit<DecisionBoard, 'id' | 'creatorId' | 'options' | 'createdAt' | 'expiresAt'> & {options: string[], durationInSeconds: number}): Promise<DecisionBoard> => {
    if (!supabase) throw new Error("Database not configured.");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
        throw new Error("No user logged in");
    }
    
    const now = Date.now();
    const expiresAt = boardData.durationInSeconds === -1 ? -1 : now + boardData.durationInSeconds * 1000;

    const newBoardData = {
      creatorId: user.email,
      title: boardData.title,
      description: boardData.description,
      isPublic: boardData.isPublic,
      createdAt: new Date(now).toISOString(),
      expiresAt: expiresAt,
      options: boardData.options.map((name, i) => ({
        id: `opt-${now}-${i}`,
        name,
        votes: 0,
        pros: [],
        cons: [],
      })),
    };

    const { data, error } = await supabase.from('boards').insert(newBoardData).select().single();
    
    if (error) {
        console.error("Error creating board:", error.message);
        throw new Error("Could not create the board.");
    }
    
    return data as DecisionBoard;
};

export const updateBoard = async (board: DecisionBoard): Promise<DecisionBoard> => {
    if (!supabase) throw new Error("Database not configured.");
    
    // Exclude 'id' from the update payload as it's the primary key and shouldn't be changed.
    const { id, ...boardToUpdate } = board;

    const { data, error } = await supabase
        .from('boards')
        .update(boardToUpdate)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating board:", error.message);
        throw new Error("Could not update the board.");
    }
    
    return data as DecisionBoard;
};
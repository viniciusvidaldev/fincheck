import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useState } from "react";
import { LaunchScreen } from "../../ui/components/LaunchScreen";
import { localStorageKeys } from "../config/localStorageKeys";
import { User } from "../entities/User";
import { usersService } from "../services/usersService";

interface AuthContextValues {
  signedIn: boolean
  signIn(accessToken: string): void
  signOut(): void
  user: User | undefined
}

export const AuthContext = createContext({} as AuthContextValues)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean>(() => {
    const storedAccessToken = localStorage.getItem(localStorageKeys.ACCESS_TOKEN)

    return !!storedAccessToken
  })

  const queryClient = useQueryClient()

  const signIn = useCallback((accessToken: string) => {
    localStorage.setItem(localStorageKeys.ACCESS_TOKEN, accessToken)

    setSignedIn(true)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(localStorageKeys.ACCESS_TOKEN)
    queryClient.removeQueries({ queryKey: ['users', 'me'] })
    setSignedIn(false)
  }, [queryClient])

  const { isError, isFetching, isSuccess, data } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersService.me,
    staleTime: Infinity,
    enabled: signedIn,
  })

  useEffect(() => {
    if (isError) {
      signOut()
    }
  }, [isError, signOut])

  return (
    <AuthContext.Provider
      value={{
        signedIn: isSuccess && signedIn,
        signIn,
        signOut,
        user: data
      }}
    >
      <LaunchScreen isLoading={isFetching} />

      {!isFetching && children}
    </AuthContext.Provider>
  )
}

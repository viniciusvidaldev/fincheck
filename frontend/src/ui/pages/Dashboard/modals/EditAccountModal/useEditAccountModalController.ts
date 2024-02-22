import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { bankAccountService } from "../../../../../app/services/bankAccountService";
import { currencyStringToNumber } from "../../../../../app/utils/currencyStringToNumber";
import { useDashboard } from "../../components/DashboardContext/useDashboard";

const schema = z.object({
  initialBalance:
    z.union([
      z.string().min(1, 'Saldo inicial é obrigatório'),
      z.number()
    ]),
  name: z.string().min(1, 'Nome da conta é obrigatório'),
  type: z.enum(['CHECKING', 'INVESTMENT', 'CASH']),
  color: z.string().min(1, 'Cor é obrigatória')
})

type FormData = z.infer<typeof schema>

export function useEditAccountModalController() {
  const {
    isEditAccountModalOpen,
    closeEditAccountModal,
    accountBeingEdited
  } = useDashboard()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      color: accountBeingEdited?.color,
      name: accountBeingEdited?.name,
      type: accountBeingEdited?.type,
      initialBalance: accountBeingEdited?.initialBalance
    }
  })

  const queryClient = useQueryClient()

  const {
    isPending,
    mutateAsync: updateAccount
  } = useMutation({
    mutationFn: bankAccountService.update,
  })

  const {
    isPending: isLoadingDelete,
    mutateAsync: removeAccount
  } = useMutation({
    mutationFn: bankAccountService.remove,
  })

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await updateAccount({
        id: accountBeingEdited!.id,
        color: data.color,
        initialBalance: currencyStringToNumber(data.initialBalance),
        name: data.name,
        type: data.type
      })

      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
      toast.success('A conta foi editada com sucesso!');

      closeEditAccountModal()
    } catch {
      toast.error('Erro ao salvar as alterações!')
    }
  })

  function handleOpenDeleteModal() {
    setIsDeleteModalOpen(true)
  }

  function handleCloseDeleteModal() {
    setIsDeleteModalOpen(false)
  }

  async function handleDeleteAccount() {
    try {
      await removeAccount(accountBeingEdited!.id)

      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
      toast.success('A conta foi deletada com sucesso!');

      closeEditAccountModal()
    } catch {
      toast.error('Erro ao deletar a conta!')
    }
  }

  return {
    isEditAccountModalOpen,
    closeEditAccountModal,
    handleSubmit,
    register,
    errors,
    control,
    isPending,
    isDeleteModalOpen,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleDeleteAccount,
    isLoadingDelete
  }
}
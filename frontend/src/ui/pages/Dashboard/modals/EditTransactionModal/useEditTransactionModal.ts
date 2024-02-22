import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Transaction } from "../../../../../app/entities/Transaction";
import { useBankAccounts } from "../../../../../app/hooks/useBankAccounts";
import { useCategories } from "../../../../../app/hooks/useCategories";
import { transactionsService } from "../../../../../app/services/transactionsService";
import { currencyStringToNumber } from "../../../../../app/utils/currencyStringToNumber";

const schema = z.object({
  value: z.union([
    z.string().min(1, 'Informe o valor'),
    z.number()
  ]),
  name: z.string().min(1, 'Informe o nome'),
  categoryId: z.string().min(1, 'Informe a categoria'),
  bankAccountId: z.string().min(1, 'Informe a conta'),
  date: z.date()
})

type FormData = z.infer<typeof schema>

export function useEditTransactionModalController(
  transaction: Transaction,
  onClose: () => void
) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankAccountId: transaction.bankAccountId,
      categoryId: transaction.categoryId,
      name: transaction.name,
      value: transaction.value,
      date: new Date(transaction.date)
    }
  })

  const { accounts } = useBankAccounts();
  const { categories: categoriesList } = useCategories();
  const queryClient = useQueryClient()

  const { isPending, mutateAsync: updateTransaction } = useMutation({
    mutationFn: transactionsService.update
  })

  const {
    isPending: isLoadingDelete,
    mutateAsync: removeTransaction
  } = useMutation({
    mutationFn: transactionsService.remove,
  })

  const handleSubmit = hookFormSubmit(async data => {
    try {
      await updateTransaction({
        id: transaction.id,
        type: transaction.type,
        value: currencyStringToNumber(data.value),
        name: data.name,
        bankAccountId: data.bankAccountId,
        categoryId: data.categoryId,
        date: data.date.toISOString(),
      })

      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })

      toast.success(
        transaction.type === 'EXPENSE'
          ? 'Despesa editada com sucesso!'
          : 'Receita editada com sucesso!'
      );

      onClose()
    } catch {
      toast.error(transaction.type === 'EXPENSE'
        ? 'Erro ao salvar despesa!'
        : 'Erro ao salvar receita!')
    }
  })

  const categories = useMemo(() => {
    return categoriesList.filter(category => category.type === transaction?.type)
  }, [categoriesList, transaction])

  async function handleDeleteTransaction() {
    try {
      await removeTransaction(transaction.id)

      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })

      toast.success(transaction.type === 'EXPENSE'
        ? 'A despesa foi deletada com sucesso!'
        : 'A receita foi deletada com sucesso!');

      onClose()
    } catch {
      toast.error(transaction.type === 'EXPENSE'
        ? 'Erro ao deletar a despesa!'
        : 'Erro ao deletar a receita!')
    }
  }

  function handleOpenDeleteModal() {
    setIsDeleteModalOpen(true)
  }

  function handleCloseDeleteModal() {
    setIsDeleteModalOpen(false)
  }

  return {
    register,
    handleSubmit,
    errors,
    control,
    accounts,
    categories,
    isLoading: isPending,
    isDeleteModalOpen,
    isLoadingDelete,
    handleDeleteTransaction,
    handleOpenDeleteModal,
    handleCloseDeleteModal
  }
}
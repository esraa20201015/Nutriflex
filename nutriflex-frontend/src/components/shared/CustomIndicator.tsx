import Spinner from '@/components/ui/Spinner'
import { ImSpinner9 } from 'react-icons/im'

const CustomIndicator = () => {
    return (
        <div className="flex items-center justify-center min-h-[200px] w-full">
            <Spinner size={40} indicator={ImSpinner9} />
        </div>
    )
}

export default CustomIndicator
